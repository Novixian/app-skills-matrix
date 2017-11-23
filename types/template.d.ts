type Question = {
  title: string,
};

type UnhydratedTemplateSkill = {
  id: number,
  name: string,
  version: number,
  criteria: string,
  type: string,
  questions: Question[],
};

type UnhydratedSkillGroup = {
  id?: number,
  category: string,
  level: string,
  skills: number[],
};

type TemplateViewModel = {
  id: string,
  name: string,
};

type NormalizedTemplateViewModel = {
  id: string,
  name: string,
  version: number,
  categories: string[],
  levels: string[],
  skillGroups: NormalizedSkillGroups,
};

type UnhydratedTemplate = NewTemplate & { id: string };

type NewTemplate = {
  name: string,
  version: number,
  categories: string[],
  levels: string[],
  skillGroups: UnhydratedSkillGroup[],
};

type NormalizedSkillGroups = { [id: string]: UnhydratedSkillGroup };
