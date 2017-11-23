// JavaScript source code

const hasState = require('./mi5-hasState');
let id = 0;

class Skill extends hasState {
    /**
     * 
     * @param {any} Module
     * @param {any} SkillName
     * @param {any} [InputParameter]
     * @param {any} [OutputParameter]
     * @param {any} [InitState]
     */
    constructor(Module, SkillName = 'defaultSkill'+id++, InputParameter = {}, OutputParameter = {}, InitState = 'Aborted') {
        this.SkillName = SkillName;
        this.InputParameter = InputParameter;
        this.OutputParameter = OutputParameter;
        this.State = State;

        

    }

        

}