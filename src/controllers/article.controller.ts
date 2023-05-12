import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ArticleDto } from 'src/dto/article/add.article.dto';
import { RoleCheckGuard } from "src/msci/role.check.guard";
import { AddPhotoPathDto } from 'src/dto/article/add.photo.dto';
import { ApiResponse } from 'src/msci/api.response';
import { Article, ArticleDocument } from 'src/schemas/article.schema';
import { ArticleService } from 'src/services/article.service';
import { diskStorage } from 'multer';
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { StorageConfiguraion } from 'config/storage.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditArticleDto } from 'src/dto/article/edit.article.dto';
import { ArticleSearchDto } from 'src/dto/article/article.search.dto';
import { ArticleRange } from 'src/dto/article/article.range.dto';
import { AllowToRoles } from 'src/msci/allow.to.roles.descriptor';
import { ArticleMailerService } from 'src/services/article.confirmation.service';
import { SendMailInfo } from 'src/dto/article/send.mail.article.dto';
import { User } from 'src/schemas/users.schemas';

@Controller('api/article')
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
        private readonly mailSenderService: ArticleMailerService
    ) { }


    @Post('newArticle')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    async addArticle(@Body() data: ArticleDto): Promise<Article | ApiResponse>{
        let article = await this.articleService.addNewArticle(data);
        if (article instanceof ApiResponse)
            return article;
        
        let mailInfo: SendMailInfo = {
            article_Id: article._id.toString(),
            userEmail: data.userEmail,
            title: data.title,
            excerpt: data.excerpt,
            description: data.description,
            date: article.created_at,
        }

        await this.mailSenderService.senderArticleEmail(mailInfo);
        return article;
    }
    
    @Post('Articles/ByUserId/:Id')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    findArticlesById(@Param("Id") userId: string): Promise<Article[]> {
        return this.articleService.getArticlesByUserId(userId);
    }
    
    @Post('Articles')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    findAllArticles(@Body() data: ArticleRange): Promise<Article[]> {
        return this.articleService.getAllArticles(data);
    }
    
    @Get('NumberOfArticles')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    getNumber(): Promise<Number> {
        return this.articleService.seeNumberOfArticles();
    }
    
    @Delete('del/specArtice/:Id')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    deleteArticleById(@Param("Id") articleId: string): Promise<ApiResponse> {
        return this.articleService.deleteArticle(articleId);
    }

    @Post('PhotoAdd/ByArticleId/:Id')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    addPhotoPath(@Param("Id") articleId: string,@Body() data: AddPhotoPathDto): Promise<Article> {
        return this.articleService.addPhotoPathInArticle(articleId, data.image_path);
    }
    
    @Patch('changeArticleStuff')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    changeArtile(@Body() data: EditArticleDto): Promise<ArticleDocument | ApiResponse> {
        return this.articleService.changeArticle(data);
    }

    @Post('search')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    searchArticles(@Body() data: ArticleSearchDto): Promise<ArticleDocument[]> {
        return this.articleService.searchArticles(data);
    }

    //provjeriti...
    @Post(':id/uploadPhoto/')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({

                destination: StorageConfiguraion.photo.destination,
                filename: (req, file, callback) => {
                
                    let original: string = file.originalname;
                    let normalized: string = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, ''); // sve sto nije ovo globalno, zamjeni praznim stringom
                    let tempTime = new Date();
                    let dateString: string = '';
                    dateString = tempTime.getFullYear().toString() + (tempTime.getMonth() + 1).toString() + tempTime.getDate().toString();
                    
                    let randomPart: string = new Array(10)
                        .fill(0)
                        .map(e => (Math.random() * 9).toFixed(0).toString()).join('');// sa metodom join se niz pretvara u string!

                    let fileName: string = dateString + '-' +randomPart +'-' + normalized;
                    fileName = fileName.toLowerCase();// za svaki slucaj da nam je bolja optimalnost naziva slika...

                    callback(null, fileName);
                }
            }),
            fileFilter:(req, file, callback) => {
                // 1. Provjera extenzije file
                if (!file.originalname.match(/\.(jpg|png)$/)) {
                    req.ErrorReqHandler = 'Incorrect file extension'; // proizvoljno nazivamo objekat koji dodavamo...
                    callback(null, false); // new Error('Incorrect file extension') smo mogli umjesto null, ali nam error ne treba u konzoli vec povratna informacija...
                    return;
                }
                
                // 2. Provjera tipa sadrzaja file (mimetype) : image/jpeg, image/png...
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.ErrorReqHandler = 'Unacceptable file mimetype';
                    callback(null, false);
                    return;
                }

                callback(null, true);
            },
            limits: {
                files: 1,
                fileSize: StorageConfiguraion.photo.maxSize
            }
        })
    )
    async uploadPhoto( @Param('id') articleId: string, @UploadedFile() photo, @Req() req): Promise<ApiResponse|Article> {
      
        if (req.ErrorReqHandler)
            return new ApiResponse('error', -4005, req.ErrorReqHandler);
        
        //real mimetype checkout
        let FileTypeResult = await fileType.fromFile(photo.path); //provjeri

        if (!FileTypeResult) {
            fs.unlinkSync(photo.path); // synchronously remove file
            return new ApiResponse('error', -453, 'Cannot read the file');
        }

        if (!(FileTypeResult.mime.includes('jpeg') || FileTypeResult.mime.includes('png'))) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -454, 'Unregular mimetype detected');
        }

        // save resized file
        await this.createResizedImage(photo, StorageConfiguraion.photo.resize.thumb);        
        await this.createResizedImage(photo, StorageConfiguraion.photo.resize.small);        


        const savedPhoto = await this.articleService.addPhotoPathInArticle(articleId,photo.filename);
        if (!savedPhoto) 
            return new ApiResponse('error', -4004, null);
        
        return savedPhoto;
    }



    async createResizedImage(photo, resizeSettings) {
       
        const destination = resizeSettings.path + "/" + photo.filename;

        await sharp(photo.path).resize({
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0.0 },
            width: resizeSettings.width,
            height: resizeSettings.height,
        }).toFile(destination);
    }

    @Delete(':articleId/DeletePhoto/:photoId')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator', 'user')
    async DeletePhoto(
        @Param('articleId') articleId: string,
        @Param('photoId') photoId: string
    ): Promise<ApiResponse> {
   
        let articleD = await this.articleService.removePhotoPathFromArticle(articleId, photoId);
        if (!articleD)
            return new ApiResponse('error', -4040, 'Article not founded.');
        
         try {
            fs.unlinkSync(StorageConfiguraion.photo.destination + photoId)
            fs.unlinkSync(StorageConfiguraion.photo.resize.thumb.path + '/' + photoId)
            fs.unlinkSync(StorageConfiguraion.photo.resize.small.path + '/' + photoId)
        } catch (e) { }

        return new ApiResponse('success', 0, 'Photo deleted')
    }

}