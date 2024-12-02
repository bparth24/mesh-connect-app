const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('mesh_connect_app_db');

// Function to handle saving data with error handling
async function handleSaveData(req, res) {
    try {
        const doc = req.body;
        const response = await db.put(doc);
        res.status(200).send(response);
    } catch (err) {
        if (err.status === 409) {
            res.status(409).send({ error: 'Document update conflict', details: err });
        } else if (err.status === 400) {
            res.status(400).send({ error: 'Bad request', details: err });
        } else {
            res.status(500).send({ error: 'Internal server error', details: err });
        }
    }
}

// Function to handle retrieving data by ID with error handling
async function handleGetData(req, res) {
    // console.log('req.params.id:', req.params.id); // Debugging purposes
    try {
        const doc = await db.get(req.params.id);
        res.status(200).send(doc);
    } catch (err) {
        if (err.status === 404) {
            res.status(404).send({ error: 'Document not found', details: err });
        } else if (err.status === 400) {
            res.status(400).send({ error: 'Bad request', details: err });
        } else {
            res.status(500).send({ error: 'Internal server error', details: err });
        }
    }
}

// Function to handle updating a document with error handling
async function handleUpdateDoc(req, res) {
    try {
        const { _id, ...updatedDoc } = req.body;

        // Retrieve the existing document
        const existingDoc = await db.get(_id);

        // Merge the existing document with the updated content
        const docToUpdate = { ...existingDoc, ...updatedDoc };

        // Save the updated document back to the database
        const response = await db.put(docToUpdate);
        res.status(200).send(response);
    } catch (err) {
        if (err.status === 404) {
            res.status(404).send({ error: 'Document not found', details: err });
        } else if (err.status === 400) {
            res.status(400).send({ error: 'Bad request', details: err });
        } else {
            res.status(500).send({ error: 'Internal server error', details: err });
        }
    }
}

// Function to handle filtering data with error handling
async function handleFilterData(req, res) {
    try {
        const selector = req.body.selector;
        const result = await db.find({ selector });
        res.status(200).send(result.docs);
    } catch (err) {
        if (err.status === 400) {
            res.status(400).send({ error: 'Bad request', details: err });
        } else {
            res.status(500).send({ error: 'Internal server error', details: err });
        }
    }
}
// TODO: This takes forever to return all docs. However, it is correctly console logging all docs. Find the issue & fix it.
async function displayAllDocs() {
    try {
        const result = await db.allDocs({ include_docs: true });
        console.log(result.rows.map(row => row.doc));
        const docs = result.rows.reduce((acc, row) => {
            const { _id, ...rest } = row.doc;
            acc[_id] = rest;
            return acc;
        }, {});
        return docs;
        // return result.rows.map(row => row.doc);
    } catch (err) {
        console.error('Error retrieving documents:', err);
    }
}

// Function to clean up all documents
async function cleanupAllDocs() {
    try {
        const result = await db.allDocs();
        const docsToDelete = result.rows.map(row => ({
            _id: row.id,
            _rev: row.value.rev,
            _deleted: true
        }));
        if (docsToDelete.length > 0) {
            await db.bulkDocs(docsToDelete);
            console.log('All documents have been deleted.');
        } else {
            console.log('No documents to delete.');
        }
    } catch (err) {
        console.error('Error cleaning up documents:', err);
    }
}

module.exports = {
    handleGetData,
    handleSaveData,
    handleUpdateDoc,
    handleFilterData,
    displayAllDocs,
    cleanupAllDocs
};