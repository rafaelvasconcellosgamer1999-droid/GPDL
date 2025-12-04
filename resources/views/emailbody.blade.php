 <div style='
            font-family: \"Inter\", Arial, sans-serif;
            background-color: #f8fafc;
            padding: 32px 20px;
            color: #0b1220;
            line-height: 1.6;
        '>

            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); overflow: hidden;'>
                
                <!-- Cabeçalho -->
                <tr>
                    <td style='background: linear-gradient(135deg, #2563eb, #1e40af); padding: 28px; text-align: center; color: #ffffff;'>
                        <h1 style='margin: 0; font-size: 1.6rem;'>Gerenciador de Processos</h1>
                        <p style='margin: 6px 0 0; font-size: 0.9rem; opacity: 0.9;'>Acesso liberado com sucesso</p>
                    </td>
                </tr>

                <!-- Conteúdo principal -->
                <tr>
                    <td style='padding: 32px;'>
                        <h2 style='font-size: 1.3rem; color: #0b1220; margin-top: 0;'>Olá, {{$nome}} 👋</h2>
                        <p style='font-size: 1rem; color: #334155;'>Seu acesso ao <strong>Gerenciador de Processos</strong> foi aprovado.</p>
                        <p style='font-size: 1rem; color: #334155; margin-bottom: 16px;'>Aqui estão suas credenciais para o primeiro login:</p>

                        <div style='background: #f1f5f9; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; border: 1px solid rgba(148,163,184,0.2);'>
                            <p style='margin: 0; font-size: 0.95rem; color: #1e293b;'><strong>Usuário:</strong> {{$usuarioRede}}</p>
                            <p style='margin: 4px 0 0; font-size: 0.95rem; color: #1e293b;'><strong>Senha Temporária:</strong> <span style='color: #2563eb; font-weight: 600;'>{{$senha}}</span></p>
                        </div>

                        <p style='font-size: 0.95rem; color: #475569;'>Por segurança, altere sua senha após o primeiro acesso.</p>

                        <!-- 
                        <div style='text-align: center; margin: 32px 0;'>
                            <a href='{$urlLogin}' style='display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; letter-spacing: 0.02em; box-shadow: 0 10px 20px rgba(37,99,235,0.25);'>Acessar o Sistema</a>
                        </div> 
                        -->

                        <p style='font-size: 0.9rem; color: #64748b; margin-top: 32px;'>Atenciosamente,<br><strong>Equipe do Gerenciador de Processos</strong></p>
                    </td>
                </tr>

                <!-- Rodapé -->
                <tr>
                    <td style='background: #f1f5f9; padding: 14px; text-align: center; font-size: 0.8rem; color: #94a3b8;'>
                        © {$ano} Gerenciador de Processos — Todos os direitos reservados.
                    </td>
                </tr>
            </table>

            <style>
                @media (prefers-color-scheme: dark) {
                    body, div[style] { background-color: #0f172a !important; color: #e2e8f0 !important; }
                    table { background-color: #1e293b !important; }
                    td { color: #e2e8f0 !important; }
                    h1, h2, strong { color: #f8fafc !important; }
                    p, span { color: #cbd5e1 !important; }
                    a[href*='login'] { background: linear-gradient(135deg, #3b82f6, #2563eb) !important; }
                    div[style*='f1f5f9'] { background-color: #334155 !important; border-color: rgba(255,255,255,0.15) !important; }
                }
            </style>
        </div>