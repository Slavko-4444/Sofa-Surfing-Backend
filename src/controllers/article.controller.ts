import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { ArticleDto } from 'src/dto/article/add.article.dto';
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

@Controller('api/article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post('newArticle')
    addArticle(@Body() data: ArticleDto): Promise<Article>{
        return this.articleService.addNewArticle(data);
    }
    
    @Post('Articles/ByUserId/:Id')
    findArticlesById(@Param("Id") userId: string): Promise<Article[]> {
        return this.articleService.getArticlesByUserId(userId);
    }
    
    @Get('Articles')
    findAllArticles(): Promise<Article[]> {
        return this.articleService.getAllArticles();
    }
    
    @Delete('del/specArtice/:Id')
    deleteArticleById(@Param("Id") articleId: string): Promise<ApiResponse> {
        return this.articleService.deleteArticle(articleId);
    }

    @Post('PhotoAdd/ByArticleId/:Id')
    addPhotoPath(@Param("Id") articleId: string,@Body() data: AddPhotoPathDto): Promise<Article> {
        return this.articleService.addPhotoPathInArticle(articleId, data.image_path);
    }


    //provjeriti...
    @Post(':id/uploadPhoto/')
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


}