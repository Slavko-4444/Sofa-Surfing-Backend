import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ArticleDto } from "src/dto/article/add.article.dto";
import { ApiResponse } from "src/msci/api.response";
import { Article, ArticleDocument } from "src/schemas/article.schema";


@Injectable()
export class ArticleService {

    constructor(@InjectModel(Article.name) private articleModel: Model<Article>) { }

    addNewArticle(data: ArticleDto): Promise<ArticleDocument> {
        return this.articleModel.create({
            user_id: data.user_id,
            title: data.title,
            excerpt: data.excerpt,
            description: data.description,
            status: data.status,
            image_path: [],
        });
    }

    getArticlesByUserId(Id:string): Promise<ArticleDocument[]> {
        return this.articleModel.find({user_id: Id});
    }
    getAllArticles(): Promise<ArticleDocument[]> {
        return this.articleModel.find().sort({createdAt: -1}).skip(0).limit(5);
    }

    async deleteArticle(id: string): Promise<ApiResponse> {
        return new Promise((resolve, reject) => this.articleModel
            .findByIdAndRemove({ _id: id })
            .exec()
            .then(res => resolve(new ApiResponse('ok', 0, 'Article successfuly removed!')))
            .catch(err => reject(new ApiResponse('error', -1123, err)))
        )
    }

    addPhotoPathInArticle(article_id: string, image_p: string): Promise<ArticleDocument> {
        return this.articleModel.findOneAndUpdate(
            {_id: article_id},
            {$push: { image_path: image_p }},
            {new: true}
        );
    }
}