from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_admin import Admin
from config import Config
from flask_admin.contrib.sqla import ModelView
from flask_cors import CORS
import pytz
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import re


app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
api = Api(app, errors={
    'NoAuthorizationError': {
        'msg': "Missing Authorization Header",
        'status': 401,
    },
    'ExpiredSignatureError': {
        'msg': "Token has expired",
        'status': 401,
    },
})

app.app_context().push()
from models import *
from serializers import *
# from admin import admin
import utils

migrate = Migrate(app, db)

# Checks if token is still valid and returns username
class Check_Token(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return {"username": current_user}, 200

# Gives token to frontend if user credentials are correct
class Login(Resource):
    def post(self):

        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Makes sure none of the inputs are blank
        if not username or not password:
            return {"msg": "Username and password are required"}, 400

        # Checks if user inputs match user information
        user = User.query.filter(func.lower(User.username) == func.lower(username)).first()

        if user and user.failed_attempts >= 5:
            return {"msg": "Account Locked"}, 400

        if user and bcrypt.check_password_hash(user.password, password):
            user.failed_attempts = 0
            access_token = create_access_token(identity=user.username)
            decryption_key = str((utils.derive_key(user.password, bytes.fromhex(user.salt)).hex()))
            return {"access_token": access_token, "user": user.username, "decryption_key": decryption_key}
        else:
            if user:
                user.failed_attempts += 1
            return {"msg": "Username or password is incorrect"}, 400
        
@app.route("/")
def index():
    return '<h1>Working</h1>'

# Lets users create an account
class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        passwordConfirm = data.get("passwordConfirm")

        # Makes sure none of the inputs are blank
        if not username or not email or not password or not passwordConfirm:
            return {"msg": "all fields required"}, 400

        # Makes sure the username input is valid
        if len(username) < 3:
            return {"msg": "Username must be 3 characters or greater"}, 400
        if len(username) > 25:
            return {"msg": "Username cannot be greater than 25 characters"}, 400
        if (User.query.filter(func.lower(User.username) == func.lower(username)).first() is not None):
            return {"msg": "Username is already in use."}, 400
        
        # Makes sure the email input is valid
        if (not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)):
            return {"msg": "Email invalid"}, 400
    
        # Makes sure the password input is valid
        if (len(password) < 8):
            return {"msg":"Passwords must be 8 characters long"}, 400
        if (not re.match(r'[A-Z]', password)):
            return {"msg":"Passwords must have 1 capital letter"}, 400
        if (not re.match(r'^(?=.*[^\w\s])|(?=.*\d).*$', password)):
            return {"msg":"Passwords must contain one special character or number"}, 400

        # Makes sure the passwordconfirm matches password
        if (password != passwordConfirm):
            return {"msg": "Passwords must match"}, 400
        
        # Hashes new password and creates an account
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return {"msg": "Account created successfully!"}, 200


# Returns a list of passwords
class PasswordList(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400

        user_timezone = request.args.get('timezone', 'UTC') # user's timezone

        folders = user.folders
        passwords = user.passwords

        # Serializes the folders and passwords
        folders = [serialize_folder(folder, user_timezone) for folder in folders]
        passwords = [serialize_password(password, user_timezone) for password in passwords]
        data = {
            "folders": folders,
            "passwords": passwords
        }

        return data, 200

# Lets user's create, update, and delete passwords
class Passwords(Resource):
    # Lets user create a account if they have a valid jwt token
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()
        
        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400

        data = request.get_json()
        account_name = data.get("account_name")
        username = data.get("username")
        password = data.get("password")
        folder_id = data.get('folder_id', None)

        # Makes sure none of the input is blank
        if not account_name or not username or not password:
            return {"msg": "All fields are required"}, 400

        # Makes sure the account_name, username, and password are valid
        if len(account_name) > 50:
            return {"msg": "Account name must be below 50 characters"}, 400
        if len(username) > 50:
            return {"msg": "Username must be below 50 characters"}, 400
        if len(password) > 50:
            return {"msg": "Password must be below 50 characters"}, 400
        
        # Creates a encryption key and encrypts new password
        key = utils.derive_key(user.password, bytes.fromhex(user.salt))
        password = utils.encrypt(password, key)
        new_password = Password(account_name=account_name, username=username, password=password)

        # Makes sure the user is the one who owns the account
        if folder_id:
            folder = Folder.query.get(folder_id)
            if folder and folder.user == user:
                new_password.folder = folder
            else:
                return jsonify({'msg': 'Folder not found or not owned by user'}), 400
        else:
            new_password.user = user

        db.session.add(new_password)
        db.session.commit()

        return {"msg": "Account added succesfully!"}, 200
    
    # Lets user update a account if they have a valid jwt token
    @jwt_required()
    def patch(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure the user exists
        if not user:
            return {"msg": "User not found"}, 400
        
        data = request.get_json()
        password_id = data.get("id")
        account_name = data.get("account_name")
        username = data.get("username")
        password = data.get("password")

        # Makes sure none of the inputs blank
        if not account_name or not username or not password or not password_id:
            return {"msg": "All fields are required"}, 400
        
        # Makes sure the account_name, username, and password are valid
        if len(account_name) > 50:
            return {"msg": "Account name must be below 50 characters"}, 400
        if len(username) > 50:
            return {"msg": "Username must be below 50 characters"}, 400
        if len(password) > 50:
            return {"msg": "Password must be below 50 characters"}, 400
        
        # Grabs account to be changed
        changedPass = Password.query.get(password_id)
    
        # Makes sure account exists
        if not changedPass:
            return {"msg": "Account not found"}, 400
        
        # Makes sure user owns account
        if changedPass.user and changedPass.user != user:
            return {"msg": "You do not own this account"}, 400
        elif changedPass.folder and changedPass.folder.user != user:
            return {"msg": "You do not own this account"}, 400
        
        # Creates encryption key and encrypts new password
        key = utils.derive_key(user.password, bytes.fromhex(user.salt))
        password = utils.encrypt(password, key)

        changedPass.account_name = account_name
        changedPass.username = username
        changedPass.password = password

        db.session.commit()

        return {"msg": "Account updated succesfully!"},200
    
    # Lets user delete a account if they have a valid jwt token
    @jwt_required()
    def delete(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user exists
        if not user:
            return {"msg": "User not found"}, 400

        # Grabs id of item to delete
        itemToDelete = request.args.get("id", None)

        # Makes sure itemToDelete is not blank
        if itemToDelete is None:
            return {"msg": "Request invalid"}, 400
        
        # Grabs item to delete
        itemToDelete = Password.query.filter_by(id=itemToDelete).first()

        # Makes sure item actually exists
        if itemToDelete is None:
            return {"msg": "Item not found"}, 400
        
        # Makes sure user is actually the owner
        if itemToDelete.user and itemToDelete.user == user:
            db.session.delete(itemToDelete)
        elif itemToDelete.folder and itemToDelete.folder.user == user:
            db.session.delete(itemToDelete)
        else:
            return {"msg":"You are not the owner of this item"}, 400
        db.session.commit()

        return {"msg": "Deletion was successful"}, 200

# Lets user create folders to store and organize passwords    
class Folders(Resource):
    # Lets user great folders
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400
        
        data = request.get_json()
        name = data.get("name")

        # Makes sure input isn't blank
        if not name:
            return {"msg": "Folder name required"}, 400
        
        # Makes sure input is valid
        if len(name) > 50:
            return {"msg": "Name must be below 50 characters"}, 400
        
        new_folder = Folder(name=name, user_id=user.id)
        db.session.add(new_folder)
        db.session.commit()

        return {"msg": "Folder added succesfully!"}, 200
    
    # Lets user update folder names
    @jwt_required()
    def patch(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400
        
        data = request.get_json()
        folder_id = data.get("id")
        folder_name = data.get("name")

        # Makes sure none of the inputs are blank
        if not folder_name or not folder_id:
            return {"msg": "All fields are required"}, 400
        
        # Makes sure the inputs are valid
        if len(folder_name) > 50:
            return {"msg": "Folder name must be below 50 characters"}, 400
      
        # Grabs that folder that is going to be updated
        changedFolder = Folder.query.get(folder_id)
    
        # Makes sure folder actually exists
        if not changedFolder:
            return {"msg": "Folder not found"}, 400
        
        # Makes sure user is actually the owner of the folder
        if not changedFolder.user or not changedFolder.user == user:
            return {"msg": "You do not own this folder"}, 400
        
        changedFolder.name = folder_name
        db.session.commit()

        return {"msg": "Folder updated succesfully!"},200
    
    # Lets user delete folders
    @jwt_required()
    def delete(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400

        # Gets the id of the item to delete
        itemToDelete = request.args.get("id", None)

        # Makes sure id is not blank
        if itemToDelete is None:
            return {"msg": "Request invalid"}, 400
        
        # Grabs item to delete
        itemToDelete = Folder.query.filter_by(id=itemToDelete).first()
        
        # Makes sure item actually exists
        if itemToDelete is None:
            return {"msg": "Item not found"}, 400
        
        # Makes sure user is actually the owner
        if itemToDelete.user == user:
            db.session.delete(itemToDelete)
            db.session.commit()
        else:
            return {"msg":"You are not the owner of this item"}, 400
        
        return {"msg": "Deletion was successful"}, 200

# Gets all user profile information
class GetProfile(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400
        
        user_timezone = request.args.get('timezone', 'UTC') # user's timezone
        
        # Grabs user information
        username = user.username
        email = user.email
        folder_count = Folder.query.filter_by(user_id=user.id).count()
        account_count = Password.query.filter_by(user_id=user.id).count()

        # Adds accounts in folder to account_count
        for folder in user.folders:
            account_count += folder.count_passwords()

        # Converts created_at time to user's timezone
        created = utils.convert_to_timezone(user.created_at, user_timezone)
        created = created.strftime('%Y-%m-%d %H:%M:%S'),

        return {"username": username, "email": email, "folder_count": folder_count, "account_count": account_count, "created": created}, 200
    
# Lets user update user information
class Profile(Resource):
    @jwt_required()
    def patch(self):
        current_user = get_jwt_identity()
        user = User.query.filter(func.lower(User.username) == func.lower(current_user)).first()

        # Makes sure user actually exists
        if not user:
            return {"msg": "User not found"}, 400

        data = request.get_json()
        username = data.get("username")        
        email = data.get("email")        

        # Makes sure the username input is valid
        if len(username) < 3:
            return {"msg": "Username must be 3 characters or greater"}, 400
        if len(username) > 25:
            return {"msg": "Username cannot be greater than 25 characters"}, 400
        if (username.lower() != user.username.lower()):
            if (User.query.filter(func.lower(User.username) == func.lower(username)).first() is not None ):
                return {"msg": "Username is already in use."}, 400
        
        # Makes sure the email input is valid
        if (not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)):
            return {"msg": "Email invalid"}, 400

        user.username = username
        user.email = email
        db.session.commit()


        return {"msg": "User information has been successfully updated"}, 200


api.add_resource(Register, '/api/register')
api.add_resource(Check_Token, '/api/check_token')
api.add_resource(Login, '/api/login')
api.add_resource(PasswordList, '/api/password_list')
api.add_resource(Passwords, '/api/passwords')
api.add_resource(Folders, '/api/folders')
api.add_resource(GetProfile, '/api/get_profile')
api.add_resource(Profile, '/api/profile')



if __name__=="__main__":
    app.run(debug=True)
