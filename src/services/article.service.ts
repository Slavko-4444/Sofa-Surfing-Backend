import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ArticleDto } from "src/dto/article/add.article.dto";
import { ArticleIDDTO } from "src/dto/article/article.id.dto";
import { ArticleRange } from "src/dto/article/article.range.dto";
import { ArticleSearchDto } from "src/dto/article/article.search.dto";
import { EditArticleDto } from "src/dto/article/edit.article.dto";
import { ApiResponse } from "src/msci/api.response";
import { Article, ArticleDocument } from "src/schemas/article.schema";


@Injectable()
export class ArticleService {

    constructor(@InjectModel(Article.name) private articleModel: Model<Article>) { }

    addNewArticle(data: ArticleDto): Promise<ArticleDocument|ApiResponse> {
        return this.articleModel.create({
            user_id: data.user_id,
            title: data.title,
            excerpt: data.excerpt,
            description: data.description,
            status: data.status,
            image_path: [],
        }).then(res =>  res)
            .catch(err => { return new ApiResponse('Error', -1223, 'Article could not be saved'); });
    }

    getArticlesByUserId(Id:string): Promise<ArticleDocument[]> {
        return this.articleModel.find({user_id: Id}).sort({ created_at: -1 });
    }

    getAllArticles(data: ArticleRange): Promise<ArticleDocument[]> {
        
        if (!data.limit)  // ako je limit dat kao nula ili nije definisan, uzimamo sve
            return this.articleModel.find().sort({createdAt: -1}).skip(data.skip);
            
        return this.articleModel.find().sort({createdAt: -1}).skip(data.skip).limit(data.limit);
    }

    getAllArticlesOfStatus(data: ArticleRange): Promise<ArticleDocument[]> {
        
        if (!data.limit)  // ako je limit dat kao nula ili nije definisan, uzimamo sve
            return this.articleModel.find({ status: 'visible' }).sort({created_at: -1}).skip(data.skip).exec();
            
        return this.articleModel.find({ status: 'visible' }).sort({created_at: -1}).skip(data.skip).limit(data.limit).exec();
    }

    async seeNumberOfArticles(): Promise<Number> {
        let article: Article[] = await this.articleModel.find({ status: 'visible' }).exec();
        return article.length;
    }

    async deleteArticle(id: string): Promise<ApiResponse> {
        return new Promise((resolve, reject) => this.articleModel
            .findByIdAndRemove({ _id: id })
            .exec()
            .then(res => resolve(new ApiResponse('ok', 0, 'Article successfuly removed!')))
            .catch(err => reject(new ApiResponse('error', -1123, err)))
        )
    }

    changeArticle(data: EditArticleDto): Promise<ArticleDocument|ApiResponse>{
        return new Promise((resolve, reject) => this.articleModel
            .findOneAndUpdate(
                { _id: data.article_id  },
                {
                     $set: {title: data.title, excerpt: data.excerpt, description: data.description, status: data.status, created_at: new Date()}
                },
                {new: true}
                )
            .exec()
            .then(res => resolve(res))
            .catch(err => reject(new ApiResponse('Error, unsuccessfuly changed', -1125, err)))
    )
    }

    searchArticles(data: ArticleSearchDto): Promise<ArticleDocument[]> {
        if (data.keywords.length)
            return this.articleModel.find({
                    title: { $regex: data.keywords, $options: 'i' } 
                    // { excerpt: { $regex: data.keywords, $options: 'i' } },
                    // { description: { $regex: data.keywords, $options: 'i' } },
                
            })
        
        return this.articleModel.find().exec();
    }
    searchArticleByID(data: string): Promise<ArticleDocument> {
        
        return this.articleModel.findById(data).exec();
    }

    addPhotoPathInArticle(article_id: string, image_p: string): Promise<ArticleDocument> {
        return this.articleModel.findOneAndUpdate(
            {_id: article_id},
            {$push: { image_path: image_p }},
            {new: true}
        );
    }

    removePhotoPathFromArticle(article_id: string, image_p: string): Promise<ArticleDocument> {
        
        return this.articleModel.findOneAndUpdate(
            {_id: article_id},
            {$pull: { image_path: image_p }},
            {new: true},
        )
    }
}