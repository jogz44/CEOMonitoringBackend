const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const multer = require("multer");
const path = require("path");
//const GridfsStorage = require('multer-gridfs-storage');
const app = express();

//middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(cors()); //accepts CORS to all routes

//app.use('/uploads/EngineeringProjects', express.static(path.join(__dirname, 'public', 'uploads', 'EngineeringProjects')));

//---------------------------------------ENGINEERING---------------------------------

const personnel = require('./routes/api/EngineeringAdmin/Personnels');
app.use('/api/Personnels', personnel);

const equipments = require('./routes/api/EngineeringAdmin/Equipments');
app.use('/api/Equipments', equipments);
app.use('/uploads/equipments', express.static(path.join(__dirname, 'public', 'uploads', 'equipments')));

const ITequipments = require('./routes/api/EngineeringAdmin/ITEquipments');
app.use('/api/ITEquipments', ITequipments);
app.use('/uploads/itEquipments', express.static(path.join(__dirname, 'public', 'uploads', 'itEquipments')));

const Projects = require('./routes/api/EngineeringAdmin/Projects');
app.use('/api/Projects', Projects);
app.use('/uploads/EngineeringProjects', express.static(path.join(__dirname, 'public', 'uploads', 'EngineeringProjects')));


// -----------------------------------ELECTRICAL------------------------------------

const Eprojects = require('./routes/api/ElectricalAdmin/electricalProjectsApi');
app.use('/api/eprojects', Eprojects);

const jobodersApi = require('./routes/api/ElectricalAdmin/requestsApi');
app.use('/api/requests',jobodersApi);

const groupsApi = require('./routes/api/ElectricalAdmin/groupsApi');
app.use('/api/groupsApi',groupsApi);



//----------------------------------USERS WITH LOGIN---------------------------------
const Users = require('./routes/api/Users');
app.use('/api/Users', Users);

const Uauth = require('./routes/api/AuthLogin');
app.use('/api/auth' , Uauth);

//-------------------------------Materials-------------------------------------------
const Materials = require('./routes/api/Items/Materials');
app.use('/api/materials', Materials);


//--------------------------------LIBRARIES------------------------------------------
const DesignationRoute = require('./routes/api/EngineeringAdmin/LibDesignation');
app.use('/api/library/designation', DesignationRoute);


const port = process.env.PORT||5000;
const MonggoConn ='mongodb://10.0.1.23:27017/CEOMonitoring';
mongoose.connect(MonggoConn, { useNewUrlParser: true, useUnifiedTopology: true, });
app.listen(port, '0.0.0.0',() => console.log(`Server started listening on PORT: ${port}`));


module.exports = MonggoConn;