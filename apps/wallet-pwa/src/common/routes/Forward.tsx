import { useMembers } from "@stores/members";
import { useUser } from "@stores/user";
import { Navigate, matchPath } from "react-router-dom";

export type ForwardProps = {
  usersTo?: string;
  membersTo?: string;
  guestsTo?: string;
  Component: React.FC;
};

export const Forward = ({ usersTo, membersTo, guestsTo, Component }: ForwardProps) => {
  const user = useUser(state => state.user)
  const members = useMembers(state => state.members)
  const hasMembers = members.length > 0
  const location = window.location
  const redirectUser = !!usersTo && !!user && !matchPath(usersTo, location.pathname)
  const redirectMember = !!membersTo && hasMembers && !matchPath(membersTo, location.pathname)
  const redirectGuest = !!guestsTo && !(user || hasMembers) && !matchPath(guestsTo, location.pathname)

  if (redirectUser) return <Navigate to={usersTo} />
  else if (redirectMember) return <Navigate to={membersTo} />
  else if (redirectGuest) return <Navigate to={guestsTo} />
  return <Component />
}
