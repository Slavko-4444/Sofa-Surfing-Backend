import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MailConfig } from "config/mail.config";
import { SendMailInfo } from "src/dto/article/send.mail.article.dto";


@Injectable()
export class ArticleMailerService { 
    constructor(private readonly mailerService: MailerService)
    { }    
    
    async senderArticleEmail(articleInof: SendMailInfo) {
        await  this.mailerService.sendMail({
            to: articleInof.userEmail,
            from: MailConfig.senderEmail,
           bcc: MailConfig.orderNotificationMail,
            subject: 'Review about your new post',
            encoding: "UTF-8",
            replyTo: 'no-replay@domain.com',
            html: this.articleHtml(articleInof)
        });
    }


    private articleHtml(info: SendMailInfo): string {
        

        return `<p>Zahvaljujemo se za Vašu aktivnost!</p>
                <br/>
                <br/>
                <p>Vaš novi oglas, prikazan je u tekstu ispod:</p>
                <div>
                <p>${info.title}</p>
                <p>${info.excerpt}</p>
                <p>${info.description}</p>
                </div>
                <p>Datum vaše objave  ${info.date.toLocaleDateString()}</p>
                <br/>
                <button style="background-color: green;  height: 40px; width: 150px; border-radius: 20px;">
                     <a href="http://localhost:3000/api/user/all" style=" text-decoration: none; color: white;">Confiramtion</a>
                </button>
               
                <br/>
                <p>Zelimo Vam ugodan dan!</p>`;
    }

}