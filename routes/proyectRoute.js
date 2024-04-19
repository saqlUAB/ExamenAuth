const express = require('express');
const rutas = express.Router();
const proyectModel = require('../models/proyect');

rutas.get('/listar', async (req, res) =>{
    try {
        const proy = await proyectModel.find();
        // console.log(tareas);
        res.json(proy);
    }
    catch(error){
        res.status(404).json({mensaje: error.message});
    }
});

rutas.post('/agregar', async (req, res) =>{
    const newProyect = new proyectModel({
        CodeProyect: req.body.CodeProyect,
        ProjectName : req.body.ProjectName,
        Description 	:	req.body.Description 		,
        Status            : req.body.Status            ,
        StartDate         : req.body.StartDate         ,
        EndDate           : req.body.EndDate           ,
        Manager           : req.body.Manager           ,
        Progress          : req.body.Progress          ,
        Priority          : req.body.Priority          ,
        Budget            : req.body.Budget            ,
        ActualCost        : req.body.ActualCost        ,
        AssignedResources : req.body.AssignedResources ,
        RisksIssues       : req.body.RisksIssues       ,
        Comments          : req.body.Comments          ,
        Client            : req.body.Client            ,
        Category          : req.body.Category          ,
        LastUpdate        : req.body.LastUpdate        ,
        ReviewDate        : req.body.ReviewDate 
    });
    try {
        const saveProyect = await newProyect.save();
        res.status(201).json(saveProyect);
        
    } catch(error){
        res.status(400).json({mensaje: error.message});
    }
});

rutas.put('/editar/:id', async (req, res) =>{
    try {
        const updateProyect = await proyectModel.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.status(201).json(updateProyect);
        
    } catch(error){
        res.status(400).json({mensaje: error.message});
    }
});

rutas.delete('/eliminar/:id', async (req, res) =>{
    try {
        const deleteProyect = await proyectModel.findByIdAndDelete(req.params.id);
        res.json({mensaje: 'Tarea eliminada correctamente'});
        
    } catch(error){
        res.status(400).json({mensaje: error.message});
    }
});
//consultas ----------------------
// - Listar proyectos segun estado
rutas.get('/proyectStatus/:status', async (req, res) =>{
    try {
        console.log(req.params.id);
        const tareasPrioridad = await proyectModel.find({ Status: req.params.status});
        res.json(tareasPrioridad);
    }
    catch(error){
        res.status(404).json({mensaje: error.message});
    }
});

//Listar por fecha de inicio  ingresada en request

rutas.post('/listarPorFecha', async (req, res) =>{
    const newProyect = new proyectModel({       
        StartDate         : req.body.StartDate
    });
    try {
        const tareasPrioridad = await proyectModel.find({ StartDate: req.body.StartDate});
        res.json(tareasPrioridad);
        
    } catch(error){
        res.status(400).json({mensaje: error.message});
    }
});
// listar proyectos que finalizan el mes actual
rutas.get('/listarProyectosFinalizanMesActual', async (req, res) =>{
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    try {
        const tareasPrioridad = await proyectModel.find({
            EndDate: {
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth
            }
        });
        
        res.json(tareasPrioridad);
    }
    catch(error){
        res.status(404).json({mensaje: error.message});
    }
});

//5 Listar proyecto entre dos fechas

rutas.post('/listarPorRangosFecha', async (req, res) =>{
   
    try {
        const { StartDate, EndDate } = req.body;

        const proyectos = await proyectModel.find({
            StartDate: { $gte: new Date(StartDate), $lte: new Date(EndDate) }
        });

        res.json(proyectos);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

//6  actualizar el progreso de un proyecto:

rutas.post('/updProgressProyect', async (req, res) =>{
   
    try {
        const { CodeProyect, Progress } = req.body;

        const proyectos = await proyectModel.updateOne(
            { CodeProyect: req.body.CodeProyect },
            { $set: { Progress: req.body.Progress} }
        );

        res.json(mensaje ="Se actualizo el proyecto "+req.body.CodeProyect + " con el porcentaje "+req.body.Progress);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});
//7 Buscar proyectos cuyo nombre o descripción contengan una palabra específica y estén en estado de "En Progreso":
rutas.post('/listNameDescSpecificWord', async (req, res) =>{
   
    try {
        const { ProjectName, Description } = req.body;

        const proyectos = await proyectModel.find({
            $or: [
                { ProjectName: { $regex: req.body.ProjectName } },
                { Description: { $regex: req.body.Description } }
            ],
            Status: "En Planificación"
        });
        res.json(proyectos);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});
//8 Buscar proyectos que estén en una categoría específica y tengan un progreso entre un rango específico (por ejemplo, del 25% al 75%)::
rutas.post('/listCategorySpecific', async (req, res) =>{
   
    try {
        const { Category  } = req.body;

        const proyectos = await proyectModel.find({
            Category: req.body.Category,
            Progress: { $gte: "20%", $lte: "75%" }
        });
        res.json(proyectos);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});
//9 para contar la cantidad de proyectos por estado:
rutas.post('/CountProyect', async (req, res) =>{
   
    try {
        const proyectos = await proyectModel.aggregate([
            { $group: { _id: "$Status", count: { $sum: 1 } } }
        ]);
        res.json(proyectos);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});
//10 para buscar y actualizar un proyecto, devolviendo solo ciertos campos del documento original:
rutas.post('/searchupd', async (req, res) =>{
   
    try {
        const proyectos = await proyectModel.findOneAndUpdate(
            { CodeProyect: req.body.CodeProyect },
            { $set: { Status: "Completado" } },
            { projection: { CodeProyect: 1, Status: 1 }, new: true }
        );
        res.json(proyectos);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});
module.exports = rutas;