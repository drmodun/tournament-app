"use client";

import {
  apiTokenScopeEnum,
  IApiTokenResponse,
  ICreatedApiTokenResponse,
} from "@tournament-app/types";
import { useCreateApiToken } from "api/client/hooks/apiTokens/useCreateApiToken";
import { useGetApiTokens } from "api/client/hooks/apiTokens/useGetApiTokens";
import { useRevokeAllApiTokens } from "api/client/hooks/apiTokens/useRevokeAllApiTokens";
import { useRevokeApiToken } from "api/client/hooks/apiTokens/useRevokeApiToken";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useToastContext } from "utils/hooks/useToastContext";
import styles from "./manageApiTokens.module.scss";

const MAX_NAME_LENGTH = 60;

// Days until expiry; null never expires
const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
  { label: "never", days: null },
];

const formatDate = (date: Date | string | null) =>
  date ? new Date(date).toLocaleDateString() : "never";

const isExpired = (token: IApiTokenResponse) =>
  token.expiresAt !== null && new Date(token.expiresAt) <= new Date();

const isActive = (token: IApiTokenResponse) =>
  !token.revokedAt && !isExpired(token);

const statusOf = (token: IApiTokenResponse) =>
  token.revokedAt
    ? `revoked ${formatDate(token.revokedAt)}`
    : isExpired(token)
      ? `expired ${formatDate(token.expiresAt)}`
      : `expires ${formatDate(token.expiresAt)}`;

export default function ManageApiTokens() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const toast = useToastContext();

  const { data, isLoading } = useGetApiTokens();
  const createToken = useCreateApiToken();
  const revokeToken = useRevokeApiToken();
  const revokeAllTokens = useRevokeAllApiTokens();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [canWrite, setCanWrite] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(90);
  const [created, setCreated] = useState<ICreatedApiTokenResponse>();
  // The token to revoke, or "all"
  const [toRevoke, setToRevoke] = useState<IApiTokenResponse | "all">();

  const activeCount = data?.filter(isActive).length ?? 0;
  const trimmedName = name.trim();

  const closeCreate = () => {
    setCreateOpen(false);
    setName("");
    setCanWrite(false);
    setExpiresInDays(90);
  };

  const handleCreate = () => {
    createToken.mutate(
      {
        name: trimmedName,
        scopes: [canWrite ? apiTokenScopeEnum.WRITE : apiTokenScopeEnum.READ],
        expiresInDays,
      },
      {
        onSuccess: (token) => {
          closeCreate();
          setCreated(token);
        },
      },
    );
  };

  const handleRevoke = () => {
    if (toRevoke === "all") revokeAllTokens.mutate();
    else if (toRevoke) revokeToken.mutate(toRevoke.id);
    setToRevoke(undefined);
  };

  const copyToken = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.token);
      toast.addToast("copied the token", "success");
    } catch {
      toast.addToast("could not copy, select the token and copy it", "error");
    }
  };

  const optionButton = (
    label: string,
    selected: boolean,
    onClick: () => void,
  ) => (
    <Button
      key={label}
      label={label}
      variant={selected ? "primary" : textColorTheme}
      onClick={onClick}
    />
  );

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <Dialog
        active={createOpen}
        onClose={closeCreate}
        variant={theme}
        className={styles.dialog}
      >
        <div className={clsx(styles.dialog, globals[`${textColorTheme}Color`])}>
          <b>new API token</b>
          <Input
            label="name"
            placeholder="e.g. Discord bot"
            variant={textColorTheme}
            controlledValue={name}
            defaultValue=""
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
          />
          <div className={styles.field}>
            <p>access</p>
            <div className={styles.options}>
              {optionButton("read only", !canWrite, () => setCanWrite(false))}
              {optionButton("read and write", canWrite, () =>
                setCanWrite(true),
              )}
            </div>
          </div>
          <div className={styles.field}>
            <p>expires after</p>
            <div className={styles.options}>
              {EXPIRY_OPTIONS.map((option) =>
                optionButton(option.label, expiresInDays === option.days, () =>
                  setExpiresInDays(option.days),
                ),
              )}
            </div>
            {expiresInDays === null && (
              <p className={globals.warningColor}>
                a token that never expires works until you revoke it. If it
                leaks, anyone holding it can act as you.
              </p>
            )}
          </div>
          <p className={globals[`${textColorTheme}MutedColor`]}>
            the token acts as you, with your rights, except that it cannot
            manage tokens, delete your account or use admin actions.
          </p>
          <div className={styles.dialogActions}>
            <Button
              label="create token"
              variant="primary"
              disabled={!trimmedName || createToken.isPending}
              onClick={handleCreate}
            />
            <Button
              label="cancel"
              variant={textColorTheme}
              onClick={closeCreate}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        active={!!created}
        onClose={() => setCreated(undefined)}
        variant={theme}
        className={styles.dialog}
      >
        <div className={clsx(styles.dialog, globals[`${textColorTheme}Color`])}>
          <b>your new token {created?.name}</b>
          <p className={globals.warningColor}>
            copy it now. It will not be shown again.
          </p>
          <code
            className={clsx(
              styles.token,
              globals[`${textColorTheme}BackgroundColor`],
              globals[`${theme}Color`],
            )}
          >
            {created?.token}
          </code>
          <p className={globals[`${textColorTheme}MutedColor`]}>
            send it as <code>Authorization: Bearer &lt;token&gt;</code>
          </p>
          <div className={styles.dialogActions}>
            <Button label="copy" variant="primary" onClick={copyToken} />
            <Button
              label="done"
              variant={textColorTheme}
              onClick={() => setCreated(undefined)}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        active={!!toRevoke}
        onClose={() => setToRevoke(undefined)}
        variant={theme}
        className={styles.dialog}
      >
        <div className={clsx(styles.dialog, globals[`${textColorTheme}Color`])}>
          <b>
            {toRevoke === "all"
              ? `revoke all ${activeCount} active tokens?`
              : `revoke ${toRevoke?.name}?`}
          </b>
          <p>
            anything still using {toRevoke === "all" ? "them" : "it"} stops
            working at once. This cannot be undone.
          </p>
          <div className={styles.dialogActions}>
            <Button label="revoke" variant="danger" onClick={handleRevoke} />
            <Button
              label="cancel"
              variant={textColorTheme}
              onClick={() => setToRevoke(undefined)}
            />
          </div>
        </div>
      </Dialog>

      <div className={styles.header}>
        <div>
          <b>API tokens</b>
          <p className={globals[`${theme}MutedColor`]}>
            for scripts, bots and integrations that use the API as you
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            label="new token"
            variant="primary"
            onClick={() => setCreateOpen(true)}
          />
          {activeCount > 0 && (
            <Button
              label="revoke all"
              variant="danger"
              onClick={() => setToRevoke("all")}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : !data?.length ? (
        <p>you have no API tokens</p>
      ) : (
        <div className={styles.cards}>
          {data.map((token) => (
            <div
              key={token.id}
              className={clsx(
                styles.card,
                globals[`${theme}BackgroundColor`],
                globals[`${textColorTheme}Color`],
                !isActive(token) && styles.inactive,
              )}
            >
              <div className={styles.details}>
                <b>{token.name}</b>
                <span className={styles.prefix}>wsh_{token.prefix}…</span>
                <div className={styles.meta}>
                  <span>created {formatDate(token.createdAt)}</span>
                  <span>
                    last used{" "}
                    {token.lastUsedAt ? formatDate(token.lastUsedAt) : "never"}
                  </span>
                  <span
                    className={clsx(
                      isActive(token) &&
                        token.expiresAt === null &&
                        globals.warningColor,
                    )}
                  >
                    {statusOf(token)}
                  </span>
                </div>
              </div>
              <div className={styles.options}>
                <Chip
                  label={
                    token.scopes.includes(apiTokenScopeEnum.WRITE)
                      ? "read and write"
                      : "read only"
                  }
                  variant={
                    token.scopes.includes(apiTokenScopeEnum.WRITE)
                      ? "warning"
                      : "primary"
                  }
                />
                {isActive(token) && (
                  <Button
                    label="revoke"
                    variant="danger"
                    onClick={() => setToRevoke(token)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
