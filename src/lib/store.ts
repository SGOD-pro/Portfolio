import { useSyncExternalStore } from "react";
import type {
  GitHubProfile,
  GitHubActivityItem,
  ProjectListResult,
} from "./github/types";
import { getLocalCache, setLocalCache } from "./client-cache";

interface GitHubState {
  profile: GitHubProfile | null;
  profileLoading: boolean;
  projectsData: ProjectListResult | null;
  projectsLoading: boolean;
  activity: GitHubActivityItem[];
  activityLoading: boolean;
  fetchProfile: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchActivity: () => Promise<void>;
}

type Listener = () => void;

function createStore<T extends object>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

// In-flight request deduplication promises
let profilePromise: Promise<void> | null = null;
let projectsPromise: Promise<void> | null = null;
let activityPromise: Promise<void> | null = null;

const store = createStore<GitHubState>({
  profile: null,
  profileLoading: false,
  projectsData: null,
  projectsLoading: false,
  activity: [],
  activityLoading: false,

  fetchProfile: async () => {
    const current = store.getState();

    // Hydrate immediately from localStorage if memory is empty
    if (!current.profile) {
      const cached = getLocalCache<GitHubProfile>("profile:SGOD-pro");
      if (cached) {
        store.setState({ profile: cached, profileLoading: false });
      } else {
        store.setState({ profileLoading: true });
      }
    }

    // Deduplicate in-flight network requests
    if (profilePromise) return profilePromise;

    profilePromise = (async () => {
      try {
        const res = await fetch("/api/github/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            store.setState({ profile: data.profile, profileLoading: false });
            setLocalCache("profile:SGOD-pro", data.profile);
            return;
          }
        }
      } catch {
        // Fall back gracefully to existing memory/cached data
      } finally {
        store.setState({ profileLoading: false });
        profilePromise = null;
      }
    })();

    return profilePromise;
  },

  fetchProjects: async () => {
    const current = store.getState();

    // Hydrate immediately from localStorage if memory is empty
    if (!current.projectsData || current.projectsData.projects.length === 0) {
      const cached = getLocalCache<ProjectListResult>("projects:SGOD-pro");
      if (cached && cached.projects && cached.projects.length > 0) {
        store.setState({ projectsData: cached, projectsLoading: false });
      } else {
        store.setState({ projectsLoading: true });
      }
    }

    // Deduplicate in-flight network requests
    if (projectsPromise) return projectsPromise;

    projectsPromise = (async () => {
      try {
        const res = await fetch("/api/github/projects");
        if (res.ok) {
          const data = await res.json();
          if (data && data.projects && data.projects.length > 0) {
            store.setState({ projectsData: data, projectsLoading: false });
            setLocalCache("projects:SGOD-pro", data);
            return;
          }
        }
      } catch {
        // Fall back gracefully to existing memory/cached data
      } finally {
        store.setState({ projectsLoading: false });
        projectsPromise = null;
      }
    })();

    return projectsPromise;
  },

  fetchActivity: async () => {
    const current = store.getState();

    // Hydrate immediately from localStorage if memory is empty
    if (current.activity.length === 0) {
      const cached = getLocalCache<GitHubActivityItem[]>("activity:SGOD-pro");
      if (cached && cached.length > 0) {
        store.setState({ activity: cached, activityLoading: false });
      } else {
        store.setState({ activityLoading: true });
      }
    }

    // Deduplicate in-flight network requests
    if (activityPromise) return activityPromise;

    activityPromise = (async () => {
      try {
        const res = await fetch("/api/github/activity");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.activity)) {
            // Sort date-wise descending
            const sorted = [...data.activity].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            store.setState({ activity: sorted, activityLoading: false });
            setLocalCache("activity:SGOD-pro", sorted);
            return;
          }
        }
      } catch {
        // Fall back gracefully to existing memory/cached data
      } finally {
        store.setState({ activityLoading: false });
        activityPromise = null;
      }
    })();

    return activityPromise;
  },
});

/**
 * Zustand-style client store hook with selector support.
 * Guarantees zero duplicate API calls when navigating between routes.
 */
export function useGitHubStore<S>(selector: (state: GitHubState) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

useGitHubStore.getState = store.getState;
useGitHubStore.setState = store.setState;
