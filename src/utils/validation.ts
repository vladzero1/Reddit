export function validateUsernameLength(username: string | any[]) {
  if (username.length <= 2) {
    return [{
      field: "username",
      message: "length must be greater than 2!",
    }];
  }
  return null;
}

export function validatePasswordLength(password: string | any[], field : string) {
  if (password.length <= 3) {
    return [{
      field: field,
      message: "length must be greater than 3!"
    }];
  }
  return null
}