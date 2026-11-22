import { useEffect } from "react";
import { LocationGate } from "./components/Location";
import { AppShell } from "./components/Shell";
import { ToastProvider } from "./components/ui";
import { match, Redirect, useRoute } from "./lib/router";
import { findUser, StoreProvider, useStore } from "./store";
import { Chat } from "./screens/Chat";
import { Create } from "./screens/Create";
import { DesignSystem } from "./screens/DesignSystem";
import { Discover } from "./screens/Discover";
import { Finished } from "./screens/Finished";
import { Landing } from "./screens/Landing";
import { Match } from "./screens/Match";
import { MeetingDetails } from "./screens/MeetingDetails";
import { MeetingMap } from "./screens/MeetingMap";
import { MyMeetings } from "./screens/MyMeetings";
import { Notifications } from "./screens/Notifications";
import { Onboarding } from "./screens/Onboarding";
import { Organizer } from "./screens/Organizer";
import { OwnProfile, ProfileEdit, UserProfile } from "./screens/Profile";

function Routes() {
  const path = useRoute();
  const { state } = useStore();
  const me = state.currentUserId;

  // Pokaż ekran dopasowania, gdy użytkownik ma nowy, jeszcze nieobejrzany match
  const unseen = me
    ? state.meetings.find(
        (m) =>
          m.status === "matched" &&
          (m.participantId === me || m.organizerId === me) &&
          !m.matchSeenBy.includes(me),
      )
    : undefined;
  useEffect(() => {
    if (unseen && path.startsWith("/app") && !path.startsWith("/app/match"))
      window.location.hash = `/app/match/${unseen.id}`;
  }, [unseen, path]);

  useEffect(() => {
    document.title = path.startsWith("/app")
      ? "Vibrent.pl – odkrywaj spotkania"
      : "Vibrent.pl — spontaniczne spotkania w Twojej okolicy";
  }, [path]);

  if (path === "/" || path === "") return <Landing />;
  if (path === "/start") return <Onboarding />;
  if (path === "/ds") return <DesignSystem />;
  if (!path.startsWith("/app")) return <Redirect to="/" />;
  if (!me) return <Redirect to="/start" />;
  // Lokalizacja jest wymagana – bez bieżącej pozycji aplikacja prosi o jej udostępnienie.
  if (findUser(state, me)?.location.mode !== "gps") return <LocationGate />;

  let p: Record<string, string> | null;
  let screen: React.ReactNode = null;
  let hideNav = false;
  if (path === "/app") screen = <Discover />;
  else if ((p = match("/app/meeting/:id", path)))
    ((screen = <MeetingDetails key={p.id} id={p.id} />), (hideNav = true));
  else if (path === "/app/create") ((screen = <Create />), (hideNav = true));
  else if (path === "/app/meetings") screen = <MyMeetings />;
  else if ((p = match("/app/meetings/:tab", path))) screen = <MyMeetings tab={p.tab} />;
  else if ((p = match("/app/organize/:id", path))) screen = <Organizer id={p.id} />;
  else if ((p = match("/app/match/:id", path))) return <Match id={p.id} />;
  else if ((p = match("/app/map/:id", path)))
    ((screen = <MeetingMap id={p.id} />), (hideNav = true));
  else if ((p = match("/app/chat/:id", path))) ((screen = <Chat id={p.id} />), (hideNav = true));
  else if ((p = match("/app/finished/:id", path))) screen = <Finished id={p.id} />;
  else if (path === "/app/notifications") screen = <Notifications />;
  else if (path === "/app/profile") screen = <OwnProfile />;
  else if (path === "/app/profile/edit") ((screen = <ProfileEdit />), (hideNav = true));
  else if ((p = match("/app/user/:id", path))) screen = <UserProfile id={p.id} />;
  else return <Redirect to="/app" />;

  return (
    <AppShell path={path} hideNav={hideNav} key={me}>
      {screen}
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </StoreProvider>
  );
}
