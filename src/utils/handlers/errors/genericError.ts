export interface IgenericError extends Error {
  code: number
}

export const genericError = ({
  message,
  code = 400,
}: Partial<IgenericError>): IgenericError => {
  const error = new Error(message) as IgenericError
  error.code = code

  return error
}
