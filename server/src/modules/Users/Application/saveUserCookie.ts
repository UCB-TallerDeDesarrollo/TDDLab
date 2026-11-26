import { Response } from "express";
export const saveUserCookie = (

    token: string,

    res: Response

): void => {

    const secure = process.env.NODE_ENV === "production";

    res.cookie("userSession", token, {

        httpOnly: true,

        secure,

        sameSite: secure ? "none" : "lax",

        path: "/",

        maxAge: 1000 * 60 * 60 * 24 * 30,

    });

};
