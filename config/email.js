import nodemailer from 'nodemailer';
import {
    SMTP_PASSWORD,
    SMTP_SERVICE,
    SMTP_USER,
} from '../src/constants/env.constant.js';

export const smtpTransport = nodemailer.createTransport({
    service: SMTP_SERVICE,
    host: 'smtp.naver.com',
    port: 465,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});
