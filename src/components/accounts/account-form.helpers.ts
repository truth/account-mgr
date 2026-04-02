export function shouldAutofillSiteName(currentSiteName: string | undefined, lastAutoSiteName: string | null) {
  const normalizedCurrent = currentSiteName?.trim() ?? "";
  const normalizedLastAuto = lastAutoSiteName?.trim() ?? "";

  return !normalizedCurrent || normalizedCurrent === normalizedLastAuto;
}

export function getInitialAutoSiteName(initialSiteName: string | undefined, platformName: string | undefined) {
  if (!initialSiteName || !platformName) {
    return null;
  }

  return initialSiteName.trim() === platformName.trim() ? platformName : null;
}
