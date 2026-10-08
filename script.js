const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const releaseList = document.getElementById('release-list');
const releaseStatus = document.getElementById('release-status');
const platformTabs = Array.from(document.querySelectorAll('[data-platform]'));
const releasesUrl = 'https://api.github.com/repos/Andrews3dfactory/TypeKey/releases';
const githubReleasesUrl = 'https://github.com/Andrews3dfactory/TypeKey/releases';
const platformInfo = {
  windows: {
    label: 'Windows',
    unavailable: 'Windows builds are not yet listed in the official releases.'
  },
  macos: {
    label: 'macOS',
    unavailable: 'macOS support is not yet available. TypeKeys macOS releases will appear here when a compatible build is ready.'
  },
  linux: {
    label: 'Linux',
    unavailable: 'Linux support is not yet available. TypeKeys Linux releases will appear here when a compatible build is ready.'
  }
};

let releaseData = [];
let activePlatform = 'windows';
let hasReleaseError = false;
let isLoadingReleases = true;

const getPlatformFromUrl = () => {
  const requested = new URLSearchParams(window.location.search).get('platform');
  return Object.prototype.hasOwnProperty.call(platformInfo, requested) ? requested : 'windows';
};

const assetMatchesPlatform = (asset, platform) => {
  const name = asset.name.toLowerCase();

  if (platform === 'windows') {
    return /\.(exe|msi)$/.test(name) || (/\b(windows|win32|win64)\b/.test(name) && /\.zip$/.test(name));
  }

  if (platform === 'macos') {
    return /\.(dmg|pkg)$/.test(name) || (/\b(mac|macos|osx|darwin)\b/.test(name) && /\.zip$/.test(name));
  }

  return /\.(appimage|deb|rpm)$/.test(name) ||
    (/\b(linux|ubuntu|debian|fedora)\b/.test(name) && /\.(zip|tar\.gz|tgz)$/.test(name));
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '';
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(1)} MB`;
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
};

const renderAsset = (asset) => {
  const row = document.createElement('div');
  row.className = 'release-asset';

  const details = document.createElement('div');
  details.className = 'release-asset-details';
  details.append(
    createTextElement('span', 'asset-name', asset.name),
    createTextElement('span', 'asset-meta', [asset.size ? formatFileSize(asset.size) : '', asset.content_type || ''].filter(Boolean).join(' · '))
  );

  const link = document.createElement('a');
  link.className = 'btn btn-primary asset-download';
  link.href = asset.browser_download_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = 'Download';
  link.setAttribute('aria-label', `Download ${asset.name}`);
  row.append(details, link);
  return row;
};

const renderRelease = (release, isLatestStable, platform) => {
  const card = document.createElement('article');
  card.className = `release-card${isLatestStable ? ' is-latest' : ''}`;

  const top = document.createElement('div');
  top.className = 'release-card-top';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'release-title-group';
  const title = createTextElement('h3', 'release-version', release.name || release.tag_name);
  if (release.name && release.tag_name && release.name !== release.tag_name) {
    title.append(createTextElement('span', 'release-tag', release.tag_name));
  }
  titleGroup.append(title);

  const badges = document.createElement('div');
  badges.className = 'release-badges';
  if (isLatestStable) {
    badges.append(createTextElement('span', 'release-badge latest-badge', 'Latest stable'));
  }
  if (release.prerelease) {
    badges.append(createTextElement('span', 'release-badge prerelease-badge', 'Pre-release'));
  } else if (!isLatestStable) {
    badges.append(createTextElement('span', 'release-badge stable-badge', 'Stable'));
  }
  titleGroup.append(badges);

  const releaseDate = release.published_at ? new Date(release.published_at) : null;
  const dateText = releaseDate && !Number.isNaN(releaseDate.getTime())
    ? `Published ${releaseDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'Publication date unavailable';
  const date = createTextElement('p', 'release-date', dateText);
  top.append(titleGroup, date);

  const assets = (Array.isArray(release.assets) ? release.assets : [])
    .filter((asset) => asset && typeof asset.name === 'string' && assetMatchesPlatform(asset, platform))
    .filter((asset) => {
      try {
        return new URL(asset.browser_download_url).hostname === 'github.com' &&
          new URL(asset.browser_download_url).protocol === 'https:';
      } catch {
        return false;
      }
    });

  const body = document.createElement('div');
  body.className = 'release-notes';
  if (release.body && release.body.trim()) {
    const notes = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Release notes';
    notes.append(summary, createTextElement('p', 'release-body', release.body.trim()));
    body.append(notes);
  } else {
    body.append(createTextElement('p', 'release-body no-release-notes', 'No release notes were provided for this release.'));
  }

  const footer = document.createElement('div');
  footer.className = 'release-card-footer';
  const releaseLink = document.createElement('a');
  releaseLink.href = release.html_url || githubReleasesUrl;
  releaseLink.target = '_blank';
  releaseLink.rel = 'noreferrer';
  releaseLink.textContent = 'Full GitHub release notes';
  footer.append(releaseLink);

  if (assets.length > 0) {
    const assetList = document.createElement('div');
    assetList.className = 'release-assets';
    assetList.setAttribute('aria-label', `${platformInfo[platform].label} download files`);
    assets.forEach((asset) => assetList.append(renderAsset(asset)));
    card.append(top, assetList, body, footer);
  } else {
    card.append(top, body, createTextElement('p', 'asset-unavailable', `No ${platformInfo[platform].label} download asset is available for this release.`), footer);
  }

  return card;
};

const renderReleases = () => {
  if (!releaseList || !releaseStatus) {
    return;
  }

  releaseList.replaceChildren();
  const selectedPlatform = platformInfo[activePlatform];
  const platformTitle = document.getElementById('selected-platform-title');
  const releasePanel = document.getElementById('release-panel');
  if (platformTitle) {
    platformTitle.textContent = `${selectedPlatform.label} releases`;
  }
  if (releasePanel) {
    releasePanel.setAttribute('aria-labelledby', `platform-${activePlatform}`);
  }
  const windowsGuidance = document.getElementById('windows-guidance');
  if (windowsGuidance) {
    windowsGuidance.hidden = activePlatform !== 'windows';
  }
  const macosBuildGuide = document.getElementById('macos-build-guide');
  if (macosBuildGuide) {
    macosBuildGuide.hidden = activePlatform !== 'macos';
  }

  if (hasReleaseError) {
    releaseStatus.replaceChildren();
    releaseStatus.append(
      createTextElement('p', 'status-title', 'Release information could not be loaded right now.'),
      createTextElement('p', 'status-detail', 'The GitHub Releases API may be temporarily unavailable or rate-limited. You can still browse the official releases page.')
    );
    releaseStatus.append(createExternalLink(githubReleasesUrl, 'Open GitHub Releases'));
    return;
  }

  if (isLoadingReleases) {
    releaseStatus.textContent = 'Loading verified release information…';
    return;
  }

  if (releaseData.length === 0) {
    releaseStatus.replaceChildren(
      createTextElement('p', 'status-title', 'No published releases were found.'),
      createTextElement('p', 'status-detail', 'Check the official GitHub page for the latest release information.')
    );
    releaseStatus.append(createExternalLink(githubReleasesUrl, 'Open GitHub Releases'));
    return;
  }

  const releases = [...releaseData].sort((left, right) => {
    const leftDate = Date.parse(left.published_at || left.created_at || '') || 0;
    const rightDate = Date.parse(right.published_at || right.created_at || '') || 0;
    return rightDate - leftDate;
  });
  const platformReleases = releases.filter((release) =>
    (Array.isArray(release.assets) ? release.assets : []).some((asset) =>
      asset && typeof asset.name === 'string' && assetMatchesPlatform(asset, activePlatform)
    ) || (activePlatform === 'windows' && (!Array.isArray(release.assets) || release.assets.length === 0))
  );

  if (platformReleases.length === 0) {
    releaseStatus.textContent = selectedPlatform.unavailable;
    return;
  }

  const latestStable = platformReleases.find((release) => !release.prerelease);
  releaseStatus.textContent = '';
  platformReleases.forEach((release) => {
    releaseList.append(renderRelease(release, release === latestStable, activePlatform));
  });
};

const createExternalLink = (href, text) => {
  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = text;
  return link;
};

const selectPlatform = (platform, updateUrl = true) => {
  if (!Object.prototype.hasOwnProperty.call(platformInfo, platform)) {
    return;
  }

  activePlatform = platform;
  platformTabs.forEach((tab) => {
    const selected = tab.dataset.platform === platform;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('platform', platform);
    window.history.pushState({ platform }, '', url);
  }

  renderReleases();
};

if (platformTabs.length > 0 && releaseList && releaseStatus) {
  platformTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectPlatform(tab.dataset.platform));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % platformTabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + platformTabs.length) % platformTabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = platformTabs.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      platformTabs[nextIndex].focus();
      selectPlatform(platformTabs[nextIndex].dataset.platform);
    });
  });

  window.addEventListener('popstate', () => {
    selectPlatform(getPlatformFromUrl(), false);
  });

  activePlatform = getPlatformFromUrl();
  selectPlatform(activePlatform, false);

  const fetchAllReleases = async () => {
    const allReleases = [];
    let nextUrl = `${releasesUrl}?per_page=100`;

    while (nextUrl) {
      const response = await fetch(nextUrl, { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) {
        throw new Error(`GitHub Releases API returned ${response.status}`);
      }

      const releases = await response.json();
      if (!Array.isArray(releases)) {
        throw new Error('GitHub Releases API returned an unexpected response.');
      }
      allReleases.push(...releases);

      const linkHeader = response.headers.get('Link') || '';
      const nextLink = linkHeader.split(',').find((link) => link.includes('rel="next"'));
      nextUrl = nextLink ? nextLink.match(/<([^>]+)>/)?.[1] || '' : '';
    }

    return allReleases;
  };

  fetchAllReleases()
    .then((releases) => {
      releaseData = releases.filter((release) => release && !release.draft);
      isLoadingReleases = false;
      renderReleases();
    })
    .catch((error) => {
      console.error('Unable to load TypeKeys releases:', error);
      hasReleaseError = true;
      isLoadingReleases = false;
      renderReleases();
    });
}
