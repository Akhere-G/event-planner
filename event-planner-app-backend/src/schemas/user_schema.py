from ..models import User
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import (
    validate,
    validates_schema,
    Schema,
    fields,
    ValidationError,
    post_dump,
    pre_load,
)
from ..models import UserRole
import re


class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User

    id = auto_field()
    username = auto_field()
    email = auto_field()
    password = auto_field(load_only=True)


class UserWithRoleSchema(Schema):
    role = fields.String(
        validate=validate.OneOf([e.value for e in UserRole]),
        metadata={
            "description": f"Must be one of: {', '.join([e.value for e in UserRole])}"
        },
    )
    user = fields.Nested(UserSchema, dump_only=True)

    @post_dump
    def flatten_output(self, data, many, **kwargs):
        if data is None:
            return None

        user_data = data.pop("user")
        if user_data is None:
            return None
        user_data["role"] = data["role"]
        return user_data


class LoginSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Please enter a valid email address.",
        },
    )
    password = fields.String(
        required=True, error_messages={"required": "Password is required."}
    )


class RegisterSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ("id",)

    @pre_load
    def camel_to_snake(self, data, many, partial, **kwargs):
        return {self._to_snake(k): v for k, v in data.items()}

    def _to_snake(self, s):
        return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()

    username = auto_field(
        validate=validate.Length(
            max=50, error="Username must be less than 50 characters."
        ),
        error_messages={"required": "Username is required."},
    )
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Please enter a valid email address.",
        },
    )
    password = auto_field(
        load_only=True,
        validate=[
            validate.Length(min=8, error="Password must be at least 8 character"),
            validate.Regexp(
                r"^(?=.*[A-Za-z])(?=.*\d).+$",
                error="Password must contain at least one letter and one number.",
            ),
        ],
        error_messages={"required": "Password is required."},
    )
    repeat_password = fields.String(
        required=True,
        load_only=True,
        error_messages={"required": "Repeat password is required."},
    )

    @validates_schema
    def validate_passwords(self, data, **kwargs):
        if data.get("password") != data.get("repeat_password"):
            raise ValidationError("Passwords must match.", field_name="repeat_password")


class AddOrUpdateUserRoleSchema(Schema):
    email = fields.Email(
        required=True, error_messages={"required": "Email is required."}
    )
    role = fields.String(
        validate=validate.OneOf([e.value for e in UserRole]),
        metadata={
            "description": f"Must be one of: {', '.join([e.value for e in UserRole])}"
        },
    )
