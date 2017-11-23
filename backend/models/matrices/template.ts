/* tslint:disable no-param-reassign */
import { Skill } from './skill';
import * as R from 'ramda';

export type EvaluationTemplate = { id: string, name: string, version: number, categories: string[], levels: string[] };

export type Template = {
  id: string,
  skillGroups: UnhydratedSkillGroup[],
  viewModel: () => TemplateViewModel,
  normalizedViewModel: () => NormalizedTemplateViewModel,
  evaluationData: () => EvaluationTemplate,
  userDetailsViewModel: () => { name: string },
  createSkillGroups: (skills: Skill[]) => { skills: UnhydratedEvaluationSkill[], skillGroups: EvaluationSkillGroup[] },
  addSkill: (level: string, category: string, skillId: number) => Template,
  replaceSkill: (level: string, category: string, oldId: number, newId: number) => Template,
  removeSkill: (level: string, category: string, skillId: number) => Template,
  hasLevel: (level: string) => boolean,
  hasCategory: (category: string) => boolean,
};

const getSkillGroup = (level: string, category: string, skillGroups: UnhydratedSkillGroup[]) =>
  R.find((group: UnhydratedSkillGroup) => (group.level === level && group.category === category), skillGroups);

const upsert = (xs, x) =>  R.contains(x, xs) ? xs : R.concat(xs, [x]);

const updateSkillGroups = (skillId: number, targetLevel: string, targetCategory: string, skillGroups: UnhydratedSkillGroup[]): UnhydratedSkillGroup[] =>
  R.map((skillGroup) => {
    const skillsLens = R.lensPath(['skills']);
    const skills = R.prop('skills', skillGroup) as number[];
    const isTarget = R.propEq('level', targetLevel, skillGroup) && R.propEq('category', targetCategory, skillGroup);

    return isTarget
      ? R.set(skillsLens, upsert(skills, skillId), skillGroup)
      : R.set(skillsLens, R.reject(R.equals(skillId), skills), skillGroup);
  })(skillGroups) as any;

const template = ({ id, name, version, categories, levels, skillGroups }: UnhydratedTemplate): Template => Object.freeze({
  id,
  skillGroups,
  viewModel() {
    return { id, name };
  },
  normalizedViewModel() {
    const skillGroupsWithId = skillGroups
      .map((skillGroup, index) => Object.assign({}, skillGroup, { id: index }));

    const indexedSkillGroups = skillGroupsWithId
      .reduce((collector, skillGroup) => {
        collector[skillGroup.id] = skillGroup;
        return collector;
      }, {});

    return { id, name, version, categories, levels, skillGroups: indexedSkillGroups };
  },
  evaluationData() {
    return { id, name, version, categories, levels };
  },
  userDetailsViewModel() {
    return { name };
  },
  createSkillGroups(allSkills) {
    let skills = [];
    const newSkillGroups = skillGroups.map((skillGroup, index) => {
      skills = skills.concat(skillGroup.skills.map(skillId =>
        Object.assign({}, allSkills[skillId].data(), { status: { previous: null, current: null } })));
      return ({
        id: index,
        category: skillGroup.category,
        level: skillGroup.level,
        skills: skillGroup.skills,
      });
    });
    return { skills, skillGroups: newSkillGroups };
  },
  addSkill(level, category, skillId) {
    const updatedSkillGroups = updateSkillGroups(skillId, level, category, skillGroups);
    return template({ id, name, version, categories, levels, skillGroups: updatedSkillGroups });
  },
  replaceSkill(level, category, oldId, newId) {
    const skillGroup = getSkillGroup(level, category, skillGroups);
    // need to handle a nasty little bug I put in (sorry future me)
    skillGroup.skills = skillGroup.skills.map(s => parseInt(s as any, 10));
    skillGroup.skills.push(newId);
    skillGroup.skills.splice(skillGroup.skills.indexOf(oldId), 1);
    return template({ id, name, version, categories, levels, skillGroups });
  },
  removeSkill(level, category, skillId) {
    const skillGroup = getSkillGroup(level, category, skillGroups);
    skillGroup.skills.splice(skillGroup.skills.indexOf(skillId), 1);
    return template({ id, name, version, categories, levels, skillGroups });
  },
  hasLevel(level) {
    return R.contains(level, levels);
  },
  hasCategory(category) {
    return R.contains(category, categories);
  },
});

export default template;

export const newTemplate = (id: string, name: string, skillGroups: UnhydratedSkillGroup[], levels: string[], categories: string[], version: number) =>
  ({
    id,
    name,
    skillGroups,
    levels,
    categories,
    version,
    createdDate: new Date(),
  });
