import { validationResult } from "express-validator";

export const validationErrorResponse = ( req, res, next ) => {
    const errors  = validationResult(req)
    //console.log(errors)
    if (!errors.isEmpty()) {
           // si hay error
        const errorList = errors.array().reduce( (acc, err) => ({ ...acc, [err.path]: err.msg }), {}  )
        return res.status(400).json({
            ok: false,
            errors: errorList
        })
    }
    else{
      console.log("Next") // si no hay error
        next()
    }
}