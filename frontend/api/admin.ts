import axios from 'axios';
import { getData, handleError } from './index';

export default ({
  adminUpdateSkillStatus(evaluationId, skillId, status): Promise<any> {
    return axios.post(`/skillz/evaluations/${evaluationId}`, { action: 'adminUpdateSkillStatus', skillId, status })
      .catch(handleError);
  },
  inviteUsers(users: string): Promise<any> {
    return axios.post(`/skillz/users`, { action: 'inviteUsers', users })
      .then(getData)
      .catch(handleError);
  },
  selectMentor(mentorId: string, userId: string): Promise<UserDetailsViewModel> {
    return axios.post(`/skillz/users/${userId}`, { action: 'selectMentor', mentorId })
      .then(getData)
      .catch(handleError);
  },
  selectLineManager(lineManagerId: string, userId: string): Promise<UserDetailsViewModel> {
    return axios.post(`/skillz/users/${userId}`, { action: 'selectLineManager', lineManagerId })
      .then(getData)
      .catch(handleError);
  },
  selectTemplate(templateId: string, userId: string): Promise<UserDetailsViewModel> {
    return axios.post(`/skillz/users/${userId}`, { action: 'selectTemplate', templateId })
      .then(getData)
      .catch(handleError);
  },
  startEvaluation(userId: string): Promise<EvaluationMetadataViewModel> {
    return axios.post(`/skillz/users/${userId}/evaluations`, { action: 'create' })
      .then(getData)
      .catch(handleError);
  },
  addTemplate(template: UnhydratedTemplate): Promise<TemplateViewModel> {
    return axios.post('/skillz/matrices/templates', { action: 'save', template })
      .then(getData)
      .catch(handleError);
  },
  addSkill(templateId, level, category, existingSkillId): Promise<{ template: TemplateViewModel, skills: UnhydratedTemplateSkill[] }> {
    return axios.post(`/skillz/matrices/templates/${templateId}`, {
      action: 'addSkill',
      level,
      category,
      existingSkillId,
    })
      .then(getData)
      .catch(handleError);
  },
  replaceSkill(templateId, level, category, skill): Promise<{ template: TemplateViewModel, skills: UnhydratedTemplateSkill[] }> {
    return axios.post(`/skillz/matrices/templates/${templateId}`, { action: 'replaceSkill', level, category, skill })
      .then(getData)
      .catch(handleError);
  },
  removeSkill(templateId, level, category, skillId): Promise<{ template: TemplateViewModel, skills: UnhydratedTemplateSkill[] }> {
    return axios.post(`/skillz/matrices/templates/${templateId}`, { action: 'removeSkill', level, category, skillId })
      .then(getData)
      .catch(handleError);
  },
  getTemplate(templateId: string): Promise<NormalizedTemplateViewModel> {
    return axios.get(`/skillz/matrices/templates/${templateId}`)
      .then(getData)
      .catch(handleError);
  },
  saveSkills(skills: UnhydratedTemplateSkill[]): Promise<UnhydratedTemplateSkill[]> {
    return axios.post('/skillz/matrices/skills', { action: 'save', skills })
      .then(getData)
      .catch(handleError);
  },
  getSkills(): Promise<UnhydratedTemplateSkill[]> {
    return axios.get('/skillz/matrices/skills')
      .then(getData)
      .catch(handleError);
  },
  updateUserDetails(userId: string, name: string, email: string): Promise<UserDetailsViewModel> {
    return axios.post(`/skillz/users/${userId}`, { action: 'updateUserDetails', name, email })
      .then(getData)
      .catch(handleError);
  },
  updateEvaluationStatus(evaluationId: string, status: string): Promise<EvaluationMetadataViewModel> {
    return axios.post(`/skillz/evaluations/${evaluationId}`, { action: 'updateEvaluationStatus', status })
      .then(getData)
      .catch(handleError);
  },
});
