from app import db
from models import User
from app import bcrypt

# Creates intial user
db.create_all()
if not User.query.first():
    hashed_password = bcrypt.generate_password_hash("Password123").decode('utf-8')
    admin = User(username="user1", email="Fake@aol.com", password=hashed_password)
    db.session.add(admin)
    db.session.commit()