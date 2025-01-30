class User implements User {
  constructor(public username: string, public password: string) {}
}

export default User

interface User {
  id?: string
  username: string
  password: string
  email?: string
}
