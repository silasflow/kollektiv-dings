import type { Lang } from '../../data/siteContent';
import Button from '../common/Button';
import TagList from '../common/TagList';
import {
  finderText,
  getOptionLabel,
  getOrientationOptions,
  getTopicOptions,
  structureLabels,
  timeLabels,
} from './finderContent';
import {
  getLocationLabel,
  normalizeInstagramUrl,
  normalizeWebsiteUrl,
} from './finderUtils';
import type { FinderCollective } from './finderTypes';
import FinderNetworkPreview from './FinderNetworkPreview';

type Props = {
  lang: Lang;
  collective: FinderCollective;
};

export default function FinderCollectiveCard({ lang, collective }: Props) {
  const t = finderText[lang];
  const topicOptions = getTopicOptions(lang);
  const orientationOptions = getOrientationOptions(lang);
  const name = collective.collectiveName || t.unnamed;
  const location = getLocationLabel(collective) || t.noLocation;
  const topicLabels = [
    ...collective.topics.map((topic) =>
      getOptionLabel(topicOptions, topic)
    ),
    ...collective.customTopics,
  ];
  const leadingOrientations = collective.ranking.slice(0, 2);

  return (
    <article className="finder-card">
      <div className="finder-card__visual">
        <FinderNetworkPreview
          collective={collective}
          label={`${name}: ${t.showInUniverse}`}
        />
      </div>

      <div className="finder-card__content">
        <header className="finder-card__header">
          <h3 className="script-heading4">{name}</h3>
          <p className="finder-card__location paragraph">
            <i className="ph-bold ph-map-pin" aria-hidden="true" />
            {location}
          </p>
        </header>

        {topicLabels.length > 0 && (
          <div className="finder-card__topics">
            <TagList items={topicLabels} />
          </div>
        )}

        <dl className="finder-card__facts">
          <div>
            <dt className="label">{t.profileStructure}</dt>
            <dd className="paragraph">
              {structureLabels[lang][collective.structure]}
            </dd>
          </div>
          <div>
            <dt className="label">{t.profileTime}</dt>
            <dd className="paragraph">
              {timeLabels[lang][collective.timeCategory]}
            </dd>
          </div>
        </dl>

        <div className="finder-card__orientations">
          <p className="label">{t.profileOrientations}</p>
          <ol>
            {leadingOrientations.map((orientation, index) => (
              <li key={orientation}>
                <span className="finder-card__rank">{index + 1}</span>
                <span className="paragraph">
                  {getOptionLabel(orientationOptions, orientation)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {collective.actsVirtually && (
          <p className="finder-card__digital label">
            <i className="ph-bold ph-wifi-high" aria-hidden="true" />
            {t.digital}
          </p>
        )}
      </div>

      <footer className="finder-card__actions">
        <Button
          variant="secondary"
          href={`/${lang}/universe-results/?highlight=${encodeURIComponent(
            collective.id
          )}`}
          icon="planet"
        >
          {t.showInUniverse}
        </Button>

        {collective.website && (
          <Button
            variant="primary"
            href={normalizeWebsiteUrl(collective.website)}
            icon="globe"
            target="_blank"
            rel="noreferrer"
          >
            {t.website}
          </Button>
        )}

        {collective.instagram && (
          <Button
            variant="primary"
            href={normalizeInstagramUrl(collective.instagram)}
            icon="instagram-logo"
            target="_blank"
            rel="noreferrer"
          >
            {t.instagram}
          </Button>
        )}
      </footer>
    </article>
  );
}