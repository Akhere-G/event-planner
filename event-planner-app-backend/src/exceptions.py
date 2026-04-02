class UserAlreadyExistsError(Exception):
    def __init__(self, message="A user with this email already exists."):
        self.message = message
        self.status_code = 409
        super().__init__(self.message)


class UserDoesNotExistError(Exception):
    def __init__(self, message="No user exists with this email."):
        self.message = message
        self.status_code = 404
        super.__init_(self.message)


class InvalidCredentialsError(Exception):
    def __init__(self, message="Invalid Credentials."):
        self.message = message
        self.status_code = 400
        super.__init_(self.message)
