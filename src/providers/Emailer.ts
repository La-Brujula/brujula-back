import Logger from './Logger';
import nodemailer from 'nodemailer';
import config from '@/config';
import hbs from 'nodemailer-express-handlebars';
import { create } from 'express-handlebars';

declare global {
  namespace Mail {
    export interface Options {
      template: string;
      text_template: string;
      context: any;
    }
  }
}

const Emailer = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.sslPort,
  secure: true,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

Emailer.use(
  'compile',
  hbs({
    viewEngine: create({
      layoutsDir: 'src/shared/templates',
      extname: '.hbs',
    }),
    viewPath: 'src/shared/templates',
    extName: '.hbs',
  })
);

export async function sendEmail(
  to: string,
  subject: string,
  content: {
    text?: string;
    template: string;
    context?: any;
  }
): Promise<boolean> {
  Emailer.sendMail({
    from: '"La Brújula" <no-reply@labrujula.com.mx>', // sender address
    to,
    subject,
    text: content.text,
    // @ts-ignore
    template: content.template,
    context: content.context,
  });
  Logger.info(`Sent email to ${to}`);
  return true;
}
