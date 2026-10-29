import argparse
import os
import smtplib
import ssl
import sys

from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import format_datetime, getaddresses


def required(name):
    value = os.getenv(name, "").strip()

    if not value:
        raise ValueError(f"Preencha a variavel {name}.")

    return value


def single_line(value):
    return " ".join(value.splitlines()).strip()


def main():
    parser = argparse.ArgumentParser(
        description="Envia uma notificacao sobre a execucao do Jenkins."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Mostra a mensagem sem conectar ao SMTP.",
    )
    parser.add_argument(
        "--status",
        help="Resultado da execucao. Padrao: variavel BUILD_RESULT.",
    )
    args = parser.parse_args()

    try:
        sender = required("EMAIL_FROM")
        recipients_text = required("EMAIL_TO")

        if any(
            "\n" in value or "\r" in value
            for value in [sender, recipients_text]
        ):
            raise ValueError("Endereco de e-mail com quebra de linha invalida.")

        recipients = [
            address
            for _, address in getaddresses([recipients_text])
        ]

        if not recipients or any(
            address.count("@") != 1
            or not all(address.split("@"))
            for address in recipients
        ):
            raise ValueError("Confira os enderecos em EMAIL_TO.")

        status = single_line(
            args.status or os.getenv("BUILD_RESULT", "UNKNOWN")
        )
        job = single_line(os.getenv("JOB_NAME", "S07"))
        number = single_line(os.getenv("BUILD_NUMBER", "local"))
        build_url = os.getenv("BUILD_URL", "").strip()

        message = EmailMessage()
        message["From"] = sender
        message["To"] = ", ".join(recipients)
        message["Subject"] = f"[S07][{status}] {job} #{number}"
        message["Date"] = format_datetime(datetime.now(timezone.utc))

        body = [
            "Notificacao de execucao do pipeline",
            "",
            f"Job: {job}",
            f"Execucao: {number}",
            f"Resultado: {status}",
            f"Branch: {os.getenv('GIT_BRANCH', 'nao informada')}",
            f"Commit: {os.getenv('GIT_COMMIT', 'nao informado')}",
            f"Duracao: {os.getenv('BUILD_DURATION', 'nao informada')}",
            f"Link: {build_url or 'nao informado'}",
        ]

        if build_url:
            body.append(
                f"Artefatos: {build_url.rstrip('/')}/artifact/"
            )

        message.set_content("\n".join(body))

        if args.dry_run:
            print("PREVIA: nenhuma conexao SMTP sera realizada.")
            print(message.as_string())
            return 0

        host = required("SMTP_HOST")
        security = os.getenv("SMTP_SECURITY", "starttls").lower()

        if security not in {"starttls", "ssl"}:
            raise ValueError("SMTP_SECURITY deve ser starttls ou ssl.")

        default_port = "465" if security == "ssl" else "587"
        port = int(os.getenv("SMTP_PORT", "").strip() or default_port)

        if not 1 <= port <= 65535:
            raise ValueError("SMTP_PORT fora do intervalo permitido.")

        username = os.getenv("SMTP_USER", "").strip()
        password = os.getenv("SMTP_PASSWORD", "")

        if bool(username) != bool(password):
            raise ValueError(
                "Preencha SMTP_USER e SMTP_PASSWORD juntos."
            )

        context = ssl.create_default_context()

        if security == "ssl":
            connection = smtplib.SMTP_SSL(
                host,
                port,
                timeout=20,
                context=context,
            )
        else:
            connection = smtplib.SMTP(host, port, timeout=20)

        with connection as smtp:
            smtp.ehlo()

            if security == "starttls":
                smtp.starttls(context=context)
                smtp.ehlo()

            if username:
                smtp.login(username, password)

            refused = smtp.send_message(
                message,
                from_addr=sender,
                to_addrs=recipients,
            )

            if refused:
                raise smtplib.SMTPException(
                    "Um ou mais destinatarios foram recusados."
                )

        print("Mensagem aceita pelo servidor SMTP.")
        return 0

    except ValueError as error:
        print(f"Erro de configuracao: {error}", file=sys.stderr)
        return 2

    except (OSError, smtplib.SMTPException) as error:
        print(
            f"Falha no envio ({type(error).__name__}). "
            "Confira o servidor e as credenciais SMTP.",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())