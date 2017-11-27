// JavaScript source code

const hasState = require('./mi5-hasState');

const ServerStructure = require("./ServerStructure");
const skillStructure = ServerStructure.skillStructure;
const pathToSkillBaseFolder = ServerStructure.pathToSkillsBaseFolder;
const pathToSkillStates = ServerStructure.pathToSkillStates;
const pathToSkillOutputParameters = ServerStructure.pathToSkillOutputParameters;
const pathToSkillInputParameters = ServerStructure.pathToSkillInputParameters;



class Skill extends hasState {
    /**
     * 
     * @param {Mi5Module} module
     * @param {string} skillName
     * @param {string|number} skillId
     */
    constructor(module, skillName, skillId) {
        let replacements = module.replacements;
        replacements.push({key: "$(skillName)", skillName});
        replacements.push({key: "$(skillId)", skillId});

        super(replacements);

        this.skillName = skillName;
        this.skillId = skillId;
        this.module = module;
        this.skillStructure = this.replaceKeys(skillStructure, replacements);
        this.pathToSkillStates = this.replaceKeys(pathToSkillStates, replacements);
        this.pathToSkillBaseFolder = this.replaceKeys(pathToSkillBaseFolder, replacements);
        this.pathToSkillInputParameters = this.replaceKeys(pathToSkillInputParameters, replacements);
        this.pathToSkillOutputParameters = this.replaceKeys(pathToSkillOutputParameters, replacements);

        if(this.module.init)
            this.init();
        else{
            this.module.once('init', ()=>{
                this.init();
            });
        }
    }

    init(){
        // add folder structure
        this.baseFolder = this.getElement(this.module.structure, this.pathToSkillBaseFolder);
        this.module.server.addStructure(this.baseFolder.nodeId, this.baseFolder.nodeId, this.skillStructure);
        // add states
        this.statesFolder = this.getElement(this.baseFolder, this.pathToSkillStates);
        this.addStatesToServer(this.statesFolder.nodeId, this.module.server);
        this.emit('init');
        this.init = true;
    }

    addInputParameter(){

    }

        

}