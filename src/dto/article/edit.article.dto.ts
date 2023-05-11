
export class EditArticleDto {
    title: string;
    excerpt: string;
    description: string;
    status: "visible" | "hidden";
    article_id: string;

}