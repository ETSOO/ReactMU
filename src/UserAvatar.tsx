import { Avatar } from "@mui/material";
import { BusinessUtils } from "@etsoo/appscript";
import { useAppContext } from "./app/ReactApp";

/**
 * User avatar props
 */
export interface UserAvatarProps {
  /**
   * Photo src
   */
  src?: string;

  /**
   * Format title
   */
  formatTitle?: (title?: string) => string;

  /**
   * Title of the user
   */
  title?: string;
}

/**
 * User avatar
 * @param props Props
 * @returns Component
 */
export function UserAvatar(props: UserAvatarProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    src,
    title,
    formatTitle = (title?: string) => {
      return BusinessUtils.formatAvatarTitle(
        title,
        3,
        app?.get<string>("me") ?? "ME"
      );
    }
  } = props;

  // Format
  const fTitle = formatTitle(title);
  const count = fTitle.length;

  return (
    <Avatar
      title={title}
      src={src}
      sx={{
        width: 48,
        height: 32,
        fontSize: count <= 2 ? "15px" : "12px"
      }}
    >
      {fTitle}
    </Avatar>
  );
}
