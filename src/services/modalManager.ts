import { renderCodexModal } from '../components/modals/CodexModal';
import { renderAttackModal } from '../components/modals/AttackModal';
import { renderCMSChartModal } from '../components/modals/CMSChartModal';
import { renderCreateMonsterModal } from '../components/modals/CreateMonsterModal';
import { renderTeamSettingsModal } from '../components/modals/TeamSettingsModal';
import { renderUserProfileModal } from '../components/modals/UserProfileModal';

export type ActiveModalType =
  | 'vacation'
  | 'attack'
  | 'leaderboard'
  | 'inventory'
  | 'webhook'
  | 'cmsDetails'
  | 'lootBox'
  | 'forge'
  | 'quests'
  | 'simulator'
  | 'radarStats'
  | 'seasonPass'
  | 'guildWar'
  | 'coopBoss'
  | 'createMonster'
  | 'postMortem'
  | 'codex'
  | 'execAnalytics'
  | 'achievements'
  | 'apiSync'
  | 'raidShop'
  | 'socialFeed'
  | 'aiPrediction'
  | 'cicdPipeline'
  | 'slackBot'
  | 'releaseMilestone'
  | 'teamSettings'
  | 'userProfile'
  | null;

export interface ModalManagerState {
  activeModal: ActiveModalType;
  selectedPostMortemMonsterId: string | null;
  attackTargetId: string | null;
  lastLootReward: string | null;
  editModalMembers: any[];
  tsModalErrorMsg: string;
  tsModalSuccessMsg: string;
  upModalErrorMsg: string;
  upModalSuccessMsg: string;
}

class ModalManager {
  private activeModal: ActiveModalType = null;
  private selectedPostMortemMonsterId: string | null = null;
  private attackTargetId: string | null = null;
  private lastLootReward: string | null = null;
  private editModalMembers: any[] = [];
  private tsModalErrorMsg: string = '';
  private tsModalSuccessMsg: string = '';
  private upModalErrorMsg: string = '';
  private upModalSuccessMsg: string = '';

  public getActiveModal(): ActiveModalType {
    return this.activeModal;
  }

  public setActiveModal(modal: ActiveModalType) {
    this.activeModal = modal;
  }

  public closeModal() {
    this.activeModal = null;
    this.tsModalErrorMsg = '';
    this.tsModalSuccessMsg = '';
    this.upModalErrorMsg = '';
    this.upModalSuccessMsg = '';
  }

  public getState(): ModalManagerState {
    return {
      activeModal: this.activeModal,
      selectedPostMortemMonsterId: this.selectedPostMortemMonsterId,
      attackTargetId: this.attackTargetId,
      lastLootReward: this.lastLootReward,
      editModalMembers: this.editModalMembers,
      tsModalErrorMsg: this.tsModalErrorMsg,
      tsModalSuccessMsg: this.tsModalSuccessMsg,
      upModalErrorMsg: this.upModalErrorMsg,
      upModalSuccessMsg: this.upModalSuccessMsg,
    };
  }

  public setEditModalMembers(members: any[]) {
    this.editModalMembers = members;
  }

  public getEditModalMembers(): any[] {
    return this.editModalMembers;
  }

  public setModalMessages(messages: {
    tsError?: string;
    tsSuccess?: string;
    upError?: string;
    upSuccess?: string;
  }) {
    if (messages.tsError !== undefined) this.tsModalErrorMsg = messages.tsError;
    if (messages.tsSuccess !== undefined) this.tsModalSuccessMsg = messages.tsSuccess;
    if (messages.upError !== undefined) this.upModalErrorMsg = messages.upError;
    if (messages.upSuccess !== undefined) this.upModalSuccessMsg = messages.upSuccess;
  }

  public setAttackTarget(id: string | null) {
    this.attackTargetId = id;
  }

  public getAttackTarget(): string | null {
    return this.attackTargetId;
  }

  public renderModal(appState: any): string {
    if (!this.activeModal) return '';

    const modalState = {
      ...appState,
      activeModal: this.activeModal,
      selectedPostMortemMonsterId: this.selectedPostMortemMonsterId,
      attackTargetId: this.attackTargetId,
      lastLootReward: this.lastLootReward,
    };

    if (this.activeModal === 'codex') return renderCodexModal(modalState);
    if (this.activeModal === 'attack') return renderAttackModal(modalState);
    if (this.activeModal === 'cmsDetails') return renderCMSChartModal(modalState);
    if (this.activeModal === 'createMonster') return renderCreateMonsterModal(modalState);
    if (this.activeModal === 'teamSettings') return renderTeamSettingsModal(this.editModalMembers, this.tsModalErrorMsg, this.tsModalSuccessMsg);
    if (this.activeModal === 'userProfile') return renderUserProfileModal(this.upModalErrorMsg, this.upModalSuccessMsg);

    return '';
  }
}

export const modalManager = new ModalManager();
