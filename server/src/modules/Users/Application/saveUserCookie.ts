import { Response } from "express";
export const saveUserCookie = (

    token: string,

    res: Response

): void => {

    res.cookie("userSession", token, {

        httpOnly: true,

        secure: true,

        sameSite: "none",

        maxAge: 1000 * 60 * 60 * 24 * 30,

    });

};
