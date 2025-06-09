import { Resource } from "@/types/game";
import styles from "./ResourceDisplay.module.css";

interface ResourceDisplayProps {
  resources: Record<string, Resource>;
}

export const ResourceDisplay = ({ resources }: ResourceDisplayProps) => {
  return (
    <div className={styles.resourceDisplay}>
      <h2>Resources</h2>
      <div className={styles.resourceList}>
        {Object.values(resources).map(
          (resource) =>
            resource.unlocked && (
              <div key={resource.id} className={styles.resourceItem}>
                <div className={styles.resourceName}>{resource.name}</div>
                <div className={styles.resourceAmount}>
                  {Math.floor(resource.amount).toLocaleString()}
                </div>
                <div className={styles.resourceRate}>
                  {resource.perSecond > 0 && (
                    <span className={styles.perSecond}>
                      +{resource.perSecond}/s
                    </span>
                  )}
                  {resource.perClick > 0 && (
                    <span className={styles.perClick}>
                      +{resource.perClick}/click
                    </span>
                  )}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};
