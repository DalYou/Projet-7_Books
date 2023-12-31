const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then(() => res.status(201).json({message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json( { error }))
 };

 exports.getThreeBestBooks = (req, res, next) => {
  Book.find()
  .sort('-averageRating')
  .limit(3)
  .then(
    (bestBooks) => {
      return res.status(200).json(bestBooks);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.bookId
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              return res.status(403).json({ message : 'Unauthorized request !'});
          } 
          console.log(bookObject);
          
          if (!req.file) {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          });
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};
exports.modifyBookRating = (req, res, next) => {
    const newRating = req.body.rating;
    const userId = req.auth.userId;
    const bookId = req.params.id;

    Book.findOne({_id: bookId})
        .then((book) => {
            const ratings = book.ratings;
            let averageRating = book.averageRating;
           
            ratings.push({userId: userId, grade: newRating});
            averageRating += ((newRating - averageRating) / ratings.length);
            

            Book.updateOne({ _id: bookId}, { averageRating: averageRating, ratings: ratings})
            .then(() => res.status(200).json({message : 'Objet modifié!', bookId}))
            .catch(error => res.status(401).json({ error }));
           
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(501).json({ error });
        });
 };

exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};