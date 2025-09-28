import React, {useState, useEffect} from 'react';
import { bookApi, authorApi } from '../api';

const Books = () => {
    interface Author {
        id: number;
        name: string;
    }

    interface Book {
        id: number;
        title: string;
        author: Author;
    }

    interface AuthorFormData {
        name: string;
    }

    interface BookFormData {
        title: string;
        author: number;
    }

    const [editingBookId, setEditingBookId] = useState<number | null>(null);

    const [authors, setAuthors] = useState<Author[]>([]);
    const [authorFormData, setAuthorFormData] = useState<AuthorFormData>({
        name: ''
    })

    const [books, setBooks] = useState<Book[]>([]);
    const [bookFormData, setBookFormData] = useState<BookFormData>({
        title: '',
        author: 0
    });

    // fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const books = await bookApi.getBooks();
                const authors = await authorApi.getAuthors();

                setBooks(books.data);
                setAuthors(authors.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleValidationErrors = (error: any, message: string) => {
        const errors = error?.response?.data?.errors || [];

        if (Array.isArray(errors) && errors.length) {
            const errorMessages = errors.map((err: {msg: string}) => err.msg).join('\n');

            alert(`Validation failed:\n${errorMessages}`);
        } else {
            alert(message);
        }
    };

    // handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, type: string) => {
        const { name, value } = e.target;

        if (type === 'books') {
            setBookFormData((prev) => ({
                ...prev, [name]: value
            }));
        }

        if (type === 'authors') {
            setAuthorFormData((prev) => ({
                ...prev, [name]: value
            }));
        }
    };

    // handle deletion of a book
    const handleBookDelete = async (bookId: number) => {
        try {
            await bookApi.deleteBook(Number(bookId));

            setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

        } catch (error) {
            handleValidationErrors(error || [], "Failed to delete book");

            console.error("Error deleting book: ", error);
        }
    };

    // handle deletion of a author
    const handleAuthorDelete = async (authorId: number) => {
        try {
            await authorApi.deleteAuthor(Number(authorId));

            setAuthors((prevAuthors) => prevAuthors.filter((author) => author.id !== authorId));

        } catch (error) {
            handleValidationErrors(error || [], "Failed to delete author");

            console.error("Error deleting author: ", error);
        }
    };

    // handle author save
    const handleAuthorSave = async (authorId: number) => {
        const updatedAuthor = authors.find((author) => author.id === authorId);

        if (!updatedAuthor) {
            return;
        }

        try {
            const updatedAuthorData = {
                name: updatedAuthor.name
            };

            await authorApi.updateAuthor(authorId, updatedAuthorData);

            setAuthors((prevAuthors) =>
                prevAuthors.map((author) =>
                    author.id === authorId ? { ...author, name: updatedAuthorData.name } : author
                )
            );

            setBooks((prevBooks) => (
                prevBooks.map((book) => (
                    book.author.id === authorId ? {
                        ...book,
                        author: {
                            ...book.author,
                            name: updatedAuthorData.name
                        }
                    } : book
                )
            )));

            alert(`Successfully updated: ${updatedAuthorData.name}`);
        } catch (error) {
            handleValidationErrors(error || [], "Failed to save author");

            console.error("Error saving author:", error);
        }
    };

    // handle a specific author edit
    const handleAuthorEdit = (authorId: number, newName: string) => {
        setAuthors(prev => prev.map(author => (
            author.id === authorId ? {
                ...author,
                name: newName
            } : author
        )));
    };

    // handle new author submission
    const handleAuthorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formAuthorData = {
            name: authorFormData.name
        };

        try {
            const response = await authorApi.addAuthor(formAuthorData);

            setAuthors((prevAuthors) => [
                ...prevAuthors,
                response.data.author
            ]);

            alert(`Successfully added: ${authorFormData.name}`);

            setAuthorFormData({
                name: ''
            });
        } catch (error) {
            handleValidationErrors(error || [], "Failed to add author");

            console.error("Error adding author: ", error);
        }
    };

    // handle new book submission
    const handleBookSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formBookData = {
            title: bookFormData.title,
            authorId: Number(bookFormData.author)
        };

        if (editingBookId) {
            try {
                await bookApi.updateBook(editingBookId, formBookData);

                setBooks((prevBooks) => 
                    prevBooks.map(book => 
                        book.id === editingBookId ? { ...book, ...formBookData } : book
                    )
                );

                alert(`Successfully edited: ${bookFormData.title}`);

                cancelBookEditing();

            } catch (error) {
                handleValidationErrors(error || [], "Failed to edit book");

                console.error("Error editing book: ", error)
            }
        } else {
            try {
                const response = await bookApi.createBook(formBookData);
    
                setBooks((prevBooks) => [
                    ...prevBooks,
                    response.data.book
                ]);
    
                alert(`Successfully added: ${bookFormData.title}`);
    
                setBookFormData({
                    title: '',
                    author: 0
                });
            } catch (error) {
                handleValidationErrors(error || [], "Failed to add book");
    
                console.error("Error adding book: ", error)
            }
        }

    };

    // select a book for editing
    const selectBookIdForEdit = (bookId: number) => {
        const book = books.find((book) => book.id === bookId);
        if (!book) return;

        setEditingBookId(bookId);
        setBookFormData({
            title: book.title,
            author: book.author.id
        });
    };
    
    // cancel book editing
    const cancelBookEditing = () => {
        setEditingBookId(null);
        setBookFormData({
            title: '',
            author: 0
        });
    };

    return (
        <>
            <h1 className="font-medium">Book Library</h1>
            <div id="books">
                <div id="book-form" className="my-8">
                    <div className="list-authors mb-10">
                        <h2 className="text-xl">Authors:</h2>
                        <form onSubmit={handleAuthorSubmit}>
                            <input 
                                type="text"
                                name="name"
                                placeholder="Enter a author name"
                                value={authorFormData.name}
                                onChange={(e) => handleInputChange(e, 'authors')}
                            />
                            <button type="submit">Add Author</button>
                        </form>
                        {authors.length ? (
                            <>
                                {authors.map((author) => (
                                    <div className="author my-2" key={author.id}>
                                        <input
                                            type="text"
                                            name="name"
                                            className="mr-5"
                                            value={author.name}
                                            onChange={(e) => handleAuthorEdit(author.id, e.target.value)}
                                        />
                                        <button onClick={() => handleAuthorSave(author.id)}>Save</button>
                                        <button onClick={() => handleAuthorDelete(author.id)}>Remove</button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p>No authors found</p>
                        )}
                    </div>
                    <h2 className="text-xl">{editingBookId ? 'Edit' : 'Add'} a book using the form below:</h2>
                    <form className="mt-5" onSubmit={handleBookSubmit}>
                        <div className="form-field">
                            <label>
                                <span className="label">Enter a Title</span>
                                 <input
                                    type="text"
                                    name="title"
                                    placeholder="Title"
                                    value={bookFormData.title}
                                    onChange={(e) => handleInputChange(e, 'books')}
                                />
                            </label>
                        </div>
                        <div className="form-field">
                            <label>
                                <span className="label">Select a Author</span>
                                <select
                                    name="author"
                                    value={bookFormData.author}
                                    onChange={(e) => handleInputChange(e, 'books')}
                                >
                                    <option disabled value="0">Select a Author</option>
                                    {authors.map((author) => (
                                        <option
                                            key={author.id}
                                            value={author.id}
                                        >
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button type="submit">{editingBookId ? 'Edit' : 'Add'} Book</button>
                        {editingBookId &&
                            <button type="button" onClick={cancelBookEditing}>Cancel Book Editing</button>
                        }
                    </form>
                </div>
                {books.length > 0 ? (
                    <div className="list-books">
                        {books.map((book) => (
                            <div className="book py-5 text-left" key={book.id}>
                                <h3 className="font-medium">Book: {book.title}</h3>
                                <p>Author: {book.author.name}</p>
                                <div className="btns mt-4">
                                    <button
                                        type="button"
                                        onClick={() => selectBookIdForEdit(book.id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleBookDelete(book.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No books found</p>
                )}
            </div>
        </>
    );
};

export default Books;