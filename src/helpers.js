const hbs = require('hbs');
const Table = require('table-builder');
const fs = require('fs');

hbs.registerHelper('listarCursos', () => {
    let listaCursos = obtenerCursos();
    const table = new Table({class: 'table'});
    const headers = {id: 'Id', nombre: 'Nombre', descripcion: 'Descripción', valor: 'Valor', modalidad: 'Modalidad', intensidad: 'Intensidad', estado: 'Estado'};
    let htmlTable = table.setHeaders(headers).setData(listaCursos).render();
    return htmlTable;
});

let obtenerCursos = () => {
    let listaCursos = require('../data/listCursos.json');
    return listaCursos;
};

let guardarCursos = (listaCursos) => {
    const texto = JSON.stringify(listaCursos);
    fs.writeFile('../data/listCursos.json', texto, (err) => {
        if (err) throw (err);           
    }); 
};

let obtenerUsuarios = () => {
    let listaUsuarios = require('../data/listUsuarios.json');
    return listaUsuarios;
};

let guardarUsuarios = (listaUsuarios) => {
    const texto = JSON.stringify(listaUsuarios);
    fs.writeFile('../data/listUsuarios.json', texto, (err) => {
        if (err) throw (err);           
    }); 
};

let obtenerInscripciones = () => {
    let listaInscripciones = require('../data/listInscripciones.json');
    return listaInscripciones;
};

let guardarInscripciones = (listaInscripciones) => {
    const texto = JSON.stringify(listaInscripciones);
    fs.writeFile('../data/listInscripciones.json', texto, (err) => {
        if (err) throw (err);           
    }); 
};

let obtenerCursosDisponibles = () => {
    let listaCursos = obtenerCursos();
    return listaCursos.filter(
            (curso) => {
                return curso.estado === "disponible";
          }
    );
};

let guardarCurso = (curso) => {
    let listaCursos = obtenerCursos();
    let cursoExistente = listaCursos.find((reg) => {
        return reg.id === curso.id;
    });
    let respuesta;

    if(!cursoExistente){
        listaCursos.push(curso);

        guardarCursos(listaCursos);
       
        respuesta = 'Curso guardado satisfactoriamente!';
    }else{   
        respuesta = 'El curso con id: ' + curso.id + ' ya existe!';        
        curso.estado = 'invalido';
    } 

    console.log(respuesta);
    curso.validacion = respuesta;          
    return curso;        
};

let inscribir = (aspirante) => {
    let listaUsuarios = obtenerUsuarios();
    let usuarioExistente = listaUsuarios.findIndex((reg) => {
        return reg.documento === aspirante.documento;
    });
    let respuesta;

    let usuario = {
        documento: aspirante.documento,
        nombre: aspirante.nombre,
        correo: aspirante.correo,
        telefono: aspirante.telefono
    };

    let listaInscripciones = obtenerInscripciones();
    let inscripcionExistente = listaInscripciones.find((reg) => {
        return reg.idAspirante === aspirante.documento && reg.idCurso === aspirante.idCurso;
    });

    if(!inscripcionExistente){
        if(usuarioExistente === -1){
            listaUsuarios.push(usuario);        
        }else{   
            listaUsuarios[usuarioExistente] = usuario   ;
        } 
    
        guardarUsuarios(listaUsuarios);
           
        listaInscripciones.push(
            {
                idAspirante: aspirante.documento,
                idCurso: aspirante.idCurso
            }
        );
        guardarInscripciones(listaInscripciones);

        respuesta = 'Inscripción guardada satisfactoriamente!';
    }
    else{
        respuesta = 'El aspirante con documento: ' + aspirante.documento + ' ya esta inscrito en el curso: ' + aspirante.nombreCurso + '!';        
        aspirante.estado = 'invalido';
    }
    
    aspirante.validacion = respuesta;          
    return aspirante;        
};

let obtenerCursosYAspirantes = () => {
    let listaCursos = obtenerCursosDisponibles();
    let listaUsuarios = obtenerUsuarios();
    let listaInscripciones = obtenerInscripciones();
    listaCursos.forEach(curso => {
        let inscripcionesCurso = listaInscripciones.filter(
            (reg) => {
                return reg.idCurso === curso.id;
          }
        );
        curso.aspirantes = [];
        inscripcionesCurso.forEach(inscripcion => {
            let usuarioExistente = listaUsuarios.find((usuario) => {
                return usuario.documento === inscripcion.idAspirante;
            });
            curso.aspirantes.push(usuarioExistente);
        });
      });
    return listaCursos;
};

let cerrarCurso = (id) => {
    let listaCursos = obtenerCursos();
    let cursoExistenteIndex = listaCursos.findIndex((reg) => {
        return reg.id === id;
    });
    listaCursos[cursoExistenteIndex].estado = 'cerrado';
    guardarCursos(listaCursos);
};

let retirarAspiranteCurso = (idCurso, documento) => {
    let listaCursos = obtenerCursos();
    let respuesta;
    let cursoExistente = listaCursos.find((reg) => {
        return reg.id === idCurso;
    });

    if(!cursoExistente){
        respuesta = 'Curso no existe. ';
    }

    let listaUsuarios = obtenerUsuarios();
    let usuarioExistente = listaUsuarios.find((reg) => {
        return reg.documento === documento;
    });

    if(!usuarioExistente){
        respuesta = 'Usuario no existe';
    }

    let listaInscripciones = obtenerInscripciones();
    let inscripcionExistenteIndex = listaInscripciones.findIndex((reg) => {
        return reg.idAspirante === documento && reg.idCurso === idCurso;
    });

    if(respuesta){
        return respuesta;
    }

    if(inscripcionExistenteIndex === -1){
        respuesta = 'El Usuario no esta inscrito en el curso';
        return respuesta;
    }
    else{
        listaInscripciones.splice(inscripcionExistenteIndex, 1);
        guardarInscripciones(listaInscripciones);

        respuesta = 'Inscripción retirada satisfactoriamente!';

        let inscripcionesCurso = listaInscripciones.filter(
            (reg) => {
                return reg.idCurso === cursoExistente.id;
          }
        );
        cursoExistente.aspirantes = [];
        inscripcionesCurso.forEach(inscripcion => {
            let usuarioExistente = listaUsuarios.find((usuario) => {
                return usuario.documento === inscripcion.idAspirante;
            });
            cursoExistente.aspirantes.push(usuarioExistente);
        });
        cursoExistente.validacion = respuesta;

        return cursoExistente;
    }
};

module.exports = {
    guardarCurso,
    obtenerCursosDisponibles,
    inscribir,
    obtenerCursosYAspirantes,
    cerrarCurso,
    retirarAspiranteCurso
};