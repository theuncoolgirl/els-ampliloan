export const HELP_EVENT = 'ampliloan:open-help';

export const requestHelp = () => {
  window.dispatchEvent(new CustomEvent(HELP_EVENT));
};
