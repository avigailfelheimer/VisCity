import {
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
} from '../services/FolderService.js';

export const fetchFolders = async (req, res, next) => {
    try {
        const folders = await getFolders(req.user.id);
        res.status(200).json(folders);
    } catch (err) {
        next(err);
    }
};

export const postFolder = async (req, res, next) => {
    try {
        const { name } = req.body;
        const folder = await createFolder(req.user.id, name);
        res.status(201).json(folder);
    } catch (err) {
        next(err);
    }
};

export const patchFolder = async (req, res, next) => {
    try {
        const { folderId } = req.params;
        const { name } = req.body;

        await renameFolder(req.user.id, Number(folderId), name);
        res.status(200).json({ success: true, message: 'Folder renamed successfully' });
    } catch (err) {
        next(err);
    }
};

export const removeFolder = async (req, res, next) => {
    try {
        const { folderId } = req.params;

        await deleteFolder(req.user.id, Number(folderId));
        res.status(200).json({ success: true, message: 'Folder deleted successfully' });
    } catch (err) {
        next(err);
    }
};
