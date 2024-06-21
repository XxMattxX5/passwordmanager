# from flask_admin import Admin
# from flask_admin.contrib.sqla import ModelView
# from flask_admin.model.form import InlineFormAdmin
# from models import User, Folder, Password

# from app import db, app

# admin = Admin(app)

# # User Admin Model
# class UserView(ModelView):
#     column_hide_backrefs = False
#     column_list = [ 'username', "email",'password',"folders", 'passwords'  ]

# # Folder Admin Model
# class FolderView(ModelView):
#     pass

# #Password Admin Model
# class PasswordView(ModelView):
#     pass

# admin.add_view(UserView(User, db.session))
# admin.add_view(PasswordView(Folder, db.session))
# admin.add_view(FolderView(Password, db.session))

