const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { guardarCurso, obtenerCursosDisponibles, inscribir, obtenerCursosYAspirantes, cerrarCurso, retirarAspiranteCurso } = require('./helpers');
require('./helpers')


const publicDirectory = path.join(__dirname, '../public');
const partialsDirectory = path.join(__dirname, '../partials');

app.use(express.static(publicDirectory));
hbs.registerPartials(partialsDirectory);
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '..', 'views'))



app.get('/addcourse', (req, res) => {
    res.render('addcourses', {
        displaymessage: 'none',
    });
});

app.post('/addcourse', (req, res) => {
   
    let curso = {};
    curso.id = parseInt(req.body.id);
    curso.nombre = req.body.nombre;
    curso.descripcion = req.body.descripcion;
    curso.valor = req.body.valor;
    curso.modalidad = req.body.modalidad !== undefined ? req.body.modalidad : '';
    curso.intensidad = req.body.intensidad;
    curso.estado = 'disponible';

    curso = guardarCurso(curso);
    if(curso.estado === 'invalido'){
        res.render('addcourses', {
            curso: curso,
            displaymessage: 'block',
            alertclass: 'danger'
        });
    }
    else{
        let cursoRespuesta = {};
        cursoRespuesta.validacion = curso.validacion;
        res.render('addcourses', {
            curso: cursoRespuesta,
            displaymessage: 'block',
            alertclass: 'success'
        });
    }
});

app.get('/seecourse', (req, res) => {
    let cursos = obtenerCursosDisponibles();
    res.render('seecourses', {
        cursos: cursos
    });
});

app.get('/enroll', (req, res) => {
    let cursos = obtenerCursosDisponibles();
    res.render('enroll', {
        cursos: cursos,
        displaymessage: 'none',
    });
});

app.post('/enroll', (req, res) => {
    let cursos = obtenerCursosDisponibles();

    let aspirante = {};
    aspirante.documento = parseInt(req.body.documento);
    aspirante.nombre = req.body.nombre;
    aspirante.correo = req.body.correo;
    aspirante.telefono = req.body.telefono;
    aspirante.idCurso = parseInt(req.body.idCurso);

    if(aspirante.idCurso){
        let cursoExistente = cursos.find((reg) => {
            return reg.id === aspirante.idCurso;
        });

        aspirante.nombreCurso = cursoExistente.nombre;

        aspirante = inscribir(aspirante);
    }
    else{
        aspirante.estado = 'invalido';
        aspirante.validacion = 'Debe seleccionar un curso para hacer la inscripción';
    }

    if(aspirante.estado === 'invalido'){
        res.render('enroll', {
            aspirante: aspirante,
            displaymessage: 'block',
            alertclass: 'danger',
            cursos: cursos
        });
    }
    else{
        let aspiranteRespuesta = {};
        aspiranteRespuesta.validacion = aspirante.validacion;
        res.render('enroll', {
            aspirante: aspiranteRespuesta,
            displaymessage: 'block',
            alertclass: 'success',
            cursos: cursos
        });
    }
});

app.get('/seeaspirant', (req, res) => {
    let cursos = obtenerCursosYAspirantes();
    res.render('seeaspirants', {
        cursos: cursos,
        displaymessage: 'none'
    });
});

app.get('/closecourse', (req, res) => {
    if(req.query.id){
        cerrarCurso(parseInt(req.query.id));
    }
    let cursos = obtenerCursosYAspirantes();
    res.render('seeaspirants', {
        cursos: cursos,
        displaymessage: 'none'
    });
});

app.post('/unsubscribe', (req, res) => {
    let aspirante = []
    let respuesta = [];
    let curso = [];
    let classRespuesta = 'danger';

    respuesta = retirarAspiranteCurso(parseInt(req.body.idCurso), parseInt(req.body.documento));
    if(respuesta.id){
        aspirante.documento = parseInt(req.query.documento);
        aspirante.idCurso = parseInt(req.query.idCurso);
        aspirante.validacion = respuesta.validacion;
        curso = respuesta;
        classRespuesta = 'success';
    }else{
        aspirante.validacion = respuesta;
    }

    let cursos = obtenerCursosYAspirantes();
    res.render('seeaspirants', {
        cursos: cursos,
        displaymessage: 'block',
        alertclass: classRespuesta,
        aspirante: aspirante,
        curso: curso
    });
});

app.get('/*', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});