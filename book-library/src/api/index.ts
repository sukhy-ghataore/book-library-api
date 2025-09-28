import axios from "axios";

const route = axios.create({
    baseURL: 'http://localhost:3000'
});

interface Book {
    id?: number;
    title: string;
    authorId: number;
}

interface Author {
    id?: number;
    name: string;
}

const bookApi = {
    async createBook(data: Book) {
        return route.post('/books', data);
    },
    async getBooks() {
        return route.get('/books');
    },
    async updateBook(bookId: number, data: Book) {
        return route.put(`/books/${bookId}`, data);
    },
    async deleteBook(bookId: number) {
        return route.delete(`/books/${bookId}`);
    }
};

const authorApi = {
    async addAuthor(data: Author) {
        return route.post('/authors', data);
    },
    async getAuthors() {
        return route.get('/authors');
    },
    async updateAuthor(authorId: number, data: Author) {
        return route.put(`/authors/${authorId}`, data);
    },
    async deleteAuthor(authorId: number) {
        return route.delete(`/authors/${authorId}`);
    }
};

export { 
    bookApi,
    authorApi
};
