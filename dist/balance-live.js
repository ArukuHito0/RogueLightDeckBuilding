const defaultRunBalance = globalThis.ASHBOUND_BALANCE_SETTINGS;
if (S.run?.balanceSettings) {
  try { balanceApply(S.run.balanceSettings); }
  catch { balanceApply(defaultRunBalance); }
  for (const entry of S.run.battleCards ?? []) hydrateBattleCard(entry);
  for (const entry of S.run.generatedCards ?? []) hydrateGeneratedCard(entry);
  render();
}
if (S.run?.kind === 'boss' && S.run.mode === 'battle') {
  bossPlan(S.run);
  render();
}

const startWithBalance = startSelectedCharacter;
let loadingRunBalance = false;
async function fetchPublishedBalance() {
  const response = await fetch('/api/balance', {cache:'no-store',signal:AbortSignal.timeout(5000)});
  if (response.status === 404) return balanceValidate(defaultRunBalance);
  if (!response.ok) throw Error('Balance settings unavailable');
  return balanceValidate((await response.json()).settings);
}

if (!globalThis.ASHBOUND_HEADLESS && !S.run) {
  fetchPublishedBalance().then(settings => {
    if (S.run || loadingRunBalance) return;
    balanceApply(settings);
    render();
  }).catch(() => {});
}

startSelectedCharacter = async function () {
  if (loadingRunBalance || S.run || !['home', 'characters'].includes(page)) return;
  const entryPage = page;
  const character = S.selectedCharacter;
  const destination = S.destinationAct;
  loadingRunBalance = true;
  try {
    const snapshot = await fetchPublishedBalance();
    if (S.run || page !== entryPage || S.selectedCharacter !== character || S.destinationAct !== destination) return;
    balanceApply(snapshot);
    startWithBalance();
    if (S.run) {
      S.run.balanceSettings = snapshot;
      save();
    }
  } catch {
    toast('公開バランス設定を読み込めませんでした。もう一度お試しください。');
  } finally {
    loadingRunBalance = false;
  }
};
