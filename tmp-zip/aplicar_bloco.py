from pathlib import Path
p = Path("src/pages/PublicoClientePage.tsx")
t = p.read_text()
if "TutorialClienteBloco" not in t:
    t = t.replace(
        'import { useParams } from "react-router-dom";',
        'import { useParams } from "react-router-dom";\nimport TutorialClienteBloco from "../components/TutorialClienteBloco";',
    )
    if "TutorialClienteBloco" not in t:
        t = t.replace(
            'import { useEffect, useState } from "react";',
            'import { useEffect, useState } from "react";\nimport TutorialClienteBloco from "../components/TutorialClienteBloco";',
        )
    if "</div>\n  );\n}" in t and "<TutorialClienteBloco" not in t:
        t = t.replace(
            "</div>\n  );\n}",
            "      <TutorialClienteBloco />\n    </div>\n  );\n}",
            1,
        )
    p.write_text(t)
    print("ok patched")
else:
    print("already patched")
