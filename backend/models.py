from app import db
from flask_login import UserMixin
from sqlalchemy import CheckConstraint
from sqlalchemy.sql import func
from datetime import datetime
import os

# User accounts
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(120), nullable=False)
    folders = db.relationship("Folder", backref='user',cascade="all, delete-orphan", lazy="select", foreign_keys='Folder.user_id')
    passwords = db.relationship("Password", backref='user',cascade="all, delete-orphan", lazy="select",  foreign_keys='Password.user_id')
    failed_attempts = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, server_default=func.now())
    salt = db.Column(db.String(40), default=os.urandom(16).hex())

    def __repr__(self):
        return self.username

# Account folders
class Folder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    passwords = db.relationship("Password", backref="folder", cascade="all, delete-orphan",lazy="select", foreign_keys='Password.folder_id')
    created_at = db.Column(db.DateTime, server_default=func.now())

    def count_passwords(self):
        return Password.query.filter_by(folder_id=self.id).count()

    def __repr__(self):
        return f"{self.name}| Folder_id - {self.id}"

# Accounts
class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=True)
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id', ondelete="CASCADE"), nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint('NOT(user_id IS NULL AND folder_id IS NULL)', name='user_or_folder_not_null'),
        CheckConstraint('NOT(user_id IS NOT NULL AND folder_id IS NOT NULL)', name='user_or_folder_not_both')
    )

    def __repr__(self):
        return f"Password_ID - {self.id}"
    
