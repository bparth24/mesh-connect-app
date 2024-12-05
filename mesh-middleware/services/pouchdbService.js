const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('mesh_connect_app_db');


/**
 * Handles saving data to the database.
 * 
 * @async
 * @function handleSaveData
 * @param {Object} req - The request object.
 * @param {Object} req.body - The document to be saved.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the result of the save operation.
 * @throws {Error} If an error occurs during the save operation, sends an appropriate error response.
 */
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


/**
 * Handles the request to get data from the database.
 *
 * @async
 * @function handleGetData
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.id - The ID of the document to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends the document if found, otherwise sends an error response.
 */
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


/**
 * Handles the update of a document in the database.
 *
 * @async
 * @function handleUpdateDoc
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing the document data.
 * @param {string} req.body._id - The ID of the document to update.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the result of the update operation.
 * @throws {Error} If an error occurs during the update process.
 */
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


/**
 * Handles filtering data from the database based on the provided selector.
 * 
 * @async
 * @function handleFilterData
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.selector - The selector object used to filter data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends the filtered documents or an error response.
 */
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

/**
 * Retrieves and displays all documents from the PouchDB database.
 *
 * This function fetches all documents from the database, logs them to the console,
 * and returns an object where each key is the document ID and the value is the document content
 * excluding the `_id` field.
 *
 * @async
 * @function displayAllDocs
 * @returns {Promise<Object>} An object containing all documents from the database, keyed by document ID.
 * @throws Will throw an error if there is an issue retrieving the documents.
 * 
 * @remarks  
 * * TODO: This takes forever to return all docs. However, it is correctly console logging all docs. Find the issue & fix it.
 */
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


/**
 * Deletes all documents from the PouchDB database.
 *
 * This function retrieves all documents from the database, marks them for deletion,
 * and then performs a bulk delete operation. If there are no documents to delete,
 * it logs a message indicating so.
 *
 * @async
 * @function cleanupAllDocs
 * @returns {Promise<void>} A promise that resolves when the cleanup operation is complete.
 * @throws {Error} If an error occurs during the cleanup process, it is logged to the console.
 */
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