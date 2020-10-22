$(function() {
    let date;
    let displayName;
    let favouriteBooks = localStorage.getItem('favourite') ?
        JSON.parse(localStorage.getItem('favourite')) : [];


    const getBookData = async() => {
        try {
            var response = await $.ajax({
                url: `https://api.nytimes.com/svc/books/v3/lists/current/combined-print-and-e-book-fiction.json?api-key=AIzaSyAZG6Rz2Jte9EG0bCDf0qTsFV24eprMV_U`,
                type: 'GET',
                dataType: 'json',
            })
            date = response.results.published_date;
            displayName = response.results.list_name;
            return sanitizeBookData(response);
        } catch (error) {
            console.log(error)
        }
    }

    const checkFavourite = (item) => {
        const index = favouriteBooks.findIndex(e => e.isbn === item.isbn);
        return (index < 0) ? false : true;
    }

    const displayData = (data) => {
        const header = $('header');
        const h1 = $('<h1></h1>').text(`List of ${displayName} books publish in ${date}`);
        header.append(h1);
        const list = $('.listDiv');
        data.forEach((d) => {
            const isFavourite = checkFavourite(d);
            const card = $('<div class="card col-lg-4 col-md-6 " style="width: 18rem;"></div>');
            const img = $('<img  class="card-img-top">').attr('src', d.image);
            const cardBody = $('<div class="card-body"></div>');
            const cardTitle = $('<div class="card-title"></div>').attr('id', d.isbn);
            const cardText = $('<div class="card-text"></div>');
            const bookText = $('<p></p>').text(d.description);
            const bookTitle = $('<h3></h3>').text(d.title);
            const bookRank = $('<h3></h3>').text(d.rank);
            const icon = isFavourite ? $('<i class="fas fa-heart favourite"></i>') : $('<i class="fas fa-heart"></i>');
            cardTitle.append(bookTitle);
            cardTitle.append(bookRank);
            cardTitle.append(icon);
            cardText.append(bookText);
            cardBody.append(cardTitle);
            cardBody.append(cardText);
            card.append(img);
            card.append(cardBody);
            list.append(card);
        })

    }

    const sanitizeListData = (data) => {
        let listNames = [];
        for (let i = 0; i < 10; i++) {
            let name = {
                listName: data.results[i].display_name,
                encodedName: data.results[i].list_name_encoded
            }
            listNames.push(name);
        }
        return listNames;
    }

    const sanitizeBookData = (data) => {
        let bookData = [];
        data.results.books.forEach((book) => {
            let b = {
                rank: book.rank,
                title: book.title,
                isbn: book.primary_isbn10,
                image: book.book_image,
                description: book.description,
                author: book.author,
                amazonURL: book.amazon_product_url
            };
            bookData.push(b);
        })
        return bookData;
    }

    //to make promise that we got the data
    let bookData = [];
    getBookData()
        .then((value) => {
            displayData(value);
            bookData = value;
        })
        .then(() => {
            $('.fa-heart').click(e => {
                const target = $(e.target);
                const targetId = target.parent().attr('id');

                const favBook = bookData.find(e => e.isbn === targetId);
                const favIndex = favouriteBooks.findIndex(e => e.isbn === targetId);

                if (favIndex < 0) {
                    favouriteBooks.push(favBook);
                } else {
                    favouriteBooks.splice(favIndex, 1);
                }
                localStorage.setItem('favourite', JSON.stringify(favouriteBooks));
                target.toggleClass('favourite');
            })
        })


})