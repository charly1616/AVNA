#!/usr/bin/env python3
"""Load/performance test for the answer verification service.

For every question it sends three requests:
  * the exact expected answer (must be correct)
  * a correct paraphrase (must be correct)
  * a wrong answer (must be incorrect)

The questions are open-ended: they ask for explanations, reasons or processes
instead of a single fact, so the verifier has to compare full sentences.

With the default 100 questions that is 300 requests against /verify.

Usage:
    python performance_test.py
    python performance_test.py --url http://127.0.0.1:8888 --questions 100 --workers 8
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass


# (question, expected answer, correct paraphrase, wrong answer)
OPEN_QUESTIONS: list[tuple[str, str, str, str]] = [
    (
        "¿Por qué es importante reciclar?",
        "Reciclar reduce la contaminación y el consumo de recursos naturales.",
        "Porque ayuda a disminuir la contaminación y a aprovechar mejor los recursos.",
        "Porque hace que la basura desaparezca sola sin necesidad de separarla.",
    ),
    (
        "¿Qué beneficios tiene hacer ejercicio regularmente?",
        "Mejora la salud física y mental, y reduce el riesgo de enfermedades.",
        "Ayuda a sentirse mejor tanto física como mentalmente y disminuye el riesgo de enfermar.",
        "Solo sirve para ganar masa muscular y no influye en la salud mental.",
    ),
    (
        "¿Cómo se forma la lluvia?",
        "El agua se evapora, se condensa en las nubes y cae como precipitación.",
        "El vapor de agua sube, forma nubes y luego cae en forma de gotas.",
        "La lluvia se genera porque el sol calienta directamente el suelo hasta derretirlo.",
    ),
    (
        "¿Cómo funciona la fotosíntesis?",
        "Las plantas usan la luz solar, el agua y el dióxido de carbono para producir glucosa y oxígeno.",
        "Las plantas transforman la luz del sol, el agua y el CO2 en azúcares y liberan oxígeno.",
        "Las plantas absorben oxígeno del aire y lo convierten directamente en agua.",
    ),
    (
        "¿Por qué es importante beber suficiente agua?",
        "El agua mantiene hidratado el cuerpo y ayuda a regular la temperatura y las funciones vitales.",
        "Beber agua hidrata el organismo y participa en la regulación de la temperatura y de los órganos.",
        "El agua solo sirve para quitar la sed y no tiene relación con el funcionamiento del cuerpo.",
    ),
    (
        "¿Qué ventajas tiene leer con frecuencia?",
        "La lectura amplía el vocabulario, mejora la comprensión y estimula la imaginación.",
        "Leer enriquece el lenguaje, ayuda a comprender mejor y desarrolla la creatividad.",
        "Leer solo sirve para memorizar datos y no mejora la comprensión ni la imaginación.",
    ),
    (
        "¿Por qué es necesario dormir bien?",
        "Dormir permite descansar, consolidar la memoria y recuperar energía para el día.",
        "El sueño ayuda a descansar, a fijar lo aprendido y a recuperar fuerzas.",
        "Dormir solo hace perder el tiempo y no influye en la memoria ni en el descanso.",
    ),
    (
        "¿Cómo se puede ahorrar energía en casa?",
        "Apagando luces y aparatos que no se usan, y usando bombillas de bajo consumo.",
        "Se ahorra energía al apagar lo que no se utiliza y al elegir iluminación eficiente.",
        "Dejando todos los aparatos encendidos para que no se estropeen al apagarlos.",
    ),
    (
        "¿Por qué son importantes los bosques?",
        "Los bosques producen oxígeno, regulan el clima y protegen el suelo y la biodiversidad.",
        "Ayudan a generar oxígeno, equilibrar el clima y conservar el suelo y las especies.",
        "Los bosques solo sirven para obtener madera y no influyen en el clima ni en el aire.",
    ),
    (
        "¿Cómo actúan las vacunas en el cuerpo?",
        "Las vacunas entrenan al sistema inmunitario para reconocer y combatir un patógeno.",
        "Enseñan a las defensas del cuerpo a identificar y enfrentar un microorganismo.",
        "Las vacunas eliminan directamente todas las enfermedades sin participar el sistema inmune.",
    ),
    (
        "¿Qué características tiene una alimentación equilibrada?",
        "Incluye variedad de alimentos en cantidades adecuadas y aporta los nutrientes necesarios.",
        "Combina distintos grupos de alimentos en porciones correctas y cubre los nutrientes que el cuerpo necesita.",
        "Consiste en comer solo un tipo de alimento todos los días para no variar la dieta.",
    ),
    (
        "¿Qué consecuencias tiene la contaminación del aire?",
        "Provoca problemas respiratorios, daña el medio ambiente y contribuye al cambio climático.",
        "Afecta la salud respiratoria, perjudica los ecosistemas y agrava el calentamiento global.",
        "Solo produce malos olores y no tiene efectos sobre la salud ni sobre el clima.",
    ),
    (
        "¿Qué es el cambio climático?",
        "Es la alteración prolongada de las temperaturas y los patrones climáticos del planeta.",
        "Se refiere a cambios duraderos en la temperatura y en el clima de la Tierra.",
        "Es un cambio momentáneo del tiempo de un día causado únicamente por las estaciones.",
    ),
    (
        "¿Por qué se erosiona el suelo?",
        "El agua y el viento arrastran la capa fértil, sobre todo cuando no hay vegetación.",
        "La lluvia y el viento desgastan y transportan la tierra, especialmente en terrenos sin plantas.",
        "El suelo se erosiona porque las piedras crecen y empujan la tierra hacia arriba.",
    ),
    (
        "¿Cuáles son las etapas del ciclo del agua?",
        "Evaporación, condensación, precipitación y acumulación o infiltración.",
        "El agua se evapora, se condensa, cae como lluvia y luego se acumula o se filtra.",
        "El ciclo del agua solo tiene una etapa: el agua permanece siempre líquida en el mar.",
    ),
    (
        "¿Qué ventajas tiene la energía solar?",
        "Es renovable, reduce la contaminación y aprovecha una fuente disponible en todo el mundo.",
        "Es una energía limpia y renovable que disminuye la contaminación y usa la luz del sol.",
        "La energía solar se agota rápido y aumenta la contaminación porque necesita carbón.",
    ),
    (
        "¿Por qué es importante la biodiversidad?",
        "Mantiene el equilibrio de los ecosistemas y aporta servicios esenciales para la vida.",
        "Conserva el equilibrio natural y proporciona recursos y servicios que sostienen la vida.",
        "La biodiversidad no influye en los ecosistemas y solo tiene valor decorativo.",
    ),
    (
        "¿Qué riesgos tienen las redes sociales?",
        "Pueden difundir desinformación, afectar la privacidad y generar dependencia o comparación constante.",
        "Exponen a noticias falsas, ponen en riesgo los datos personales y pueden crear adicción.",
        "Las redes sociales no presentan riesgos porque toda la información que circula es verificada.",
    ),
    (
        "¿Cómo se protege la información personal en internet?",
        "Usando contraseñas seguras, evitando compartir datos sensibles y verificando los sitios.",
        "Con claves fuertes, sin publicar información privada y comprobando que las páginas sean confiables.",
        "Compartiendo la contraseña con todos para no olvidarla y publicando los datos personales.",
    ),
    (
        "¿Por qué es importante lavarse las manos?",
        "Elimina gérmenes y reduce la transmisión de enfermedades infecciosas.",
        "Quita microorganismos y disminuye el contagio de infecciones.",
        "Lavarse las manos solo sirve para quitar la suciedad visible y no elimina gérmenes.",
    ),
    (
        "¿Qué beneficios aporta aprender otro idioma?",
        "Mejora la comunicación, amplía oportunidades y ejercita la memoria y la flexibilidad mental.",
        "Permite comunicarse con más personas, abre puertas laborales y entrena la mente.",
        "Aprender otro idioma solo sirve para traducir textos y no aporta beneficios cognitivos.",
    ),
    (
        "¿Por qué la música puede ayudar en la educación?",
        "Estimula la memoria, la atención y la creatividad, y puede hacer el aprendizaje más motivador.",
        "Favorece la concentración, la memoria y la imaginación, además de motivar a los estudiantes.",
        "La música distrae siempre y no tiene ningún efecto sobre la memoria ni la motivación.",
    ),
    (
        "¿Qué hace efectivo el trabajo en equipo?",
        "La comunicación, la cooperación y el reparto claro de tareas hacia un objetivo común.",
        "Funciona cuando hay diálogo, colaboración y responsabilidades bien distribuidas.",
        "El trabajo en equipo es efectivo cuando cada persona actúa solo sin comunicarse con los demás.",
    ),
    (
        "¿Cómo se puede resolver un conflicto de forma pacífica?",
        "Escuchando a las partes, dialogando y buscando acuerdos que respeten a todos.",
        "Con diálogo, escucha activa y acuerdos que tengan en cuenta a las dos partes.",
        "Imponiendo la opinión de uno y evitando escuchar lo que piensa la otra persona.",
    ),
    (
        "¿Qué es la empatía?",
        "Es la capacidad de comprender y compartir los sentimientos de otra persona.",
        "Consiste en entender lo que siente el otro y ponerse en su lugar.",
        "Es la capacidad de ignorar los sentimientos ajenos y pensar solo en uno mismo.",
    ),
    (
        "¿Por qué es útil planificar las tareas?",
        "Permite organizar el tiempo, priorizar y reducir el estrés al cumplir los objetivos.",
        "Ayuda a ordenar el tiempo, decidir qué es más importante y evitar agobios.",
        "Planificar hace perder tiempo y no ayuda a organizarse ni a cumplir metas.",
    ),
    (
        "¿Cómo se pueden alcanzar las metas personales?",
        "Definiéndolas con claridad, dividiéndolas en pasos y manteniendo la constancia.",
        "Con objetivos claros, pequeños pasos y disciplina para no abandonar.",
        "Esperando a que las metas se cumplan solas sin esfuerzo ni planificación.",
    ),
    (
        "¿Por qué es recomendable ahorrar dinero?",
        "Permite afrontar imprevistos, cumplir metas y tener seguridad económica.",
        "Da tranquilidad, ayuda a resolver emergencias y facilita alcanzar proyectos.",
        "Ahorrar no sirve de nada porque el dinero pierde valor si no se gasta de inmediato.",
    ),
    (
        "¿Qué debe incluir un presupuesto personal?",
        "Los ingresos, los gastos fijos y variables, y una parte destinada al ahorro.",
        "Debe registrar lo que se gana, lo que se gasta y lo que se reserva para ahorrar.",
        "Un presupuesto solo debe anotar los gastos y puede ignorar por completo los ingresos.",
    ),
    (
        "¿Qué hace falta para emprender un proyecto?",
        "Una idea clara, planificación, recursos y capacidad para adaptarse a los problemas.",
        "Se necesita una buena idea, un plan, medios disponibles y flexibilidad ante dificultades.",
        "Solo hace falta tener una idea y no importa planificar ni conseguir recursos.",
    ),
    (
        "¿Cómo influye la publicidad en las decisiones de compra?",
        "Puede crear deseos y asociar productos con emociones, aunque no siempre informa objetivamente.",
        "Influye generando interés y relacionando lo que se vende con sentimientos, a veces sin datos objetivos.",
        "La publicidad nunca influye en las compras porque las personas siempre deciden de forma racional.",
    ),
    (
        "¿Qué función cumplen los medios de comunicación?",
        "Informar, formar opinión y dar voz a la sociedad, con responsabilidad sobre lo que publican.",
        "Sirven para informar, ayudar a formar criterio y mostrar lo que ocurre en la sociedad.",
        "Los medios solo existen para entretener y no tienen ninguna responsabilidad informativa.",
    ),
    (
        "¿Cómo se puede reconocer una noticia falsa?",
        "Comprobando la fuente, contrastando la información y desconfiando de titulares sensacionalistas.",
        "Verificando de dónde viene, comparándola con otras fuentes y revisando si el titular exagera.",
        "Basta con compartirla rápido si tiene muchas visitas, sin revisar la fuente ni el contenido.",
    ),
    (
        "¿Qué características tiene una democracia?",
        "El poder se ejerce mediante representantes elegidos y se respetan los derechos y las libertades.",
        "El pueblo elige a sus gobernantes y se garantizan derechos, libertades y participación.",
        "Una sola persona concentra todo el poder y no existen elecciones ni derechos.",
    ),
    (
        "¿Por qué son importantes los derechos humanos?",
        "Protegen la dignidad y las libertades de todas las personas por igual.",
        "Defienden la dignidad y la libertad de cada persona sin importar su origen.",
        "Solo protegen a algunos grupos privilegiados y pueden ignorarse según la situación.",
    ),
    (
        "¿Qué aporta la igualdad de género?",
        "Permite que todas las personas tengan las mismas oportunidades y derechos.",
        "Garantiza oportunidades y derechos equivalentes para mujeres y hombres.",
        "Mantiene diferencias de derechos y oportunidades según el género de cada persona.",
    ),
    (
        "¿Qué beneficios tiene el voluntariado?",
        "Ayuda a la comunidad, desarrolla habilidades y fortalece la empatía y la responsabilidad social.",
        "Contribuye a la sociedad, enseña nuevas capacidades y fomenta la solidaridad.",
        "El voluntariado solo beneficia a quien lo recibe y no aporta nada a quien lo realiza.",
    ),
    (
        "¿Por qué es valiosa la diversidad cultural?",
        "Favorece el intercambio de ideas, el respeto y la creatividad de la sociedad.",
        "Permite aprender de otras tradiciones, fomenta el respeto y enriquece la creatividad.",
        "La diversidad cultural debe evitarse porque impide que las sociedades aprendan entre sí.",
    ),
    (
        "¿Para qué sirve estudiar historia?",
        "Ayuda a comprender el presente, aprender de errores pasados y valorar el patrimonio.",
        "Permite entender la actualidad, sacar lecciones del pasado y apreciar la herencia cultural.",
        "Estudiar historia solo sirve para memorizar fechas y no ayuda a entender el presente.",
    ),
    (
        "¿Qué permite la ciencia?",
        "Explicar fenómenos naturales mediante observación, experimentación y evidencia.",
        "Ayuda a entender el mundo con pruebas, observaciones y experimentos.",
        "La ciencia se basa en opiniones sin pruebas y no busca explicar los fenómenos naturales.",
    ),
    (
        "¿Cuáles son los pasos del método científico?",
        "Observación, formulación de hipótesis, experimentación, análisis y conclusiones.",
        "Se observa un fenómeno, se plantea una hipótesis, se experimenta, se analiza y se concluye.",
        "El método científico solo consiste en creer una idea sin observarla ni comprobarla.",
    ),
    (
        "¿Por qué los objetos caen hacia la Tierra?",
        "Porque la gravedad atrae los cuerpos hacia el centro del planeta.",
        "La fuerza de gravedad los atrae en dirección al centro de la Tierra.",
        "Los objetos caen porque el aire los empuja hacia abajo con una fuerza magnética.",
    ),
    (
        "¿Cómo llega la electricidad a los hogares?",
        "Se genera en centrales y se transporta por cables y redes de distribución.",
        "Se produce en plantas de generación y viaja por la red eléctrica hasta las casas.",
        "La electricidad aparece espontáneamente en los enchufes sin necesidad de generación ni cables.",
    ),
    (
        "¿Cómo funcionan los imanes?",
        "Tienen polos norte y sur y atraen o repelen otros materiales magnéticos.",
        "Presentan dos polos y ejercen fuerzas de atracción o repulsión sobre metales magnéticos.",
        "Los imanes solo atraen cualquier objeto sin importar si es magnético o no.",
    ),
    (
        "¿Cuáles son los estados del agua?",
        "Sólido, líquido y gaseoso, según la temperatura y la presión.",
        "Puede ser hielo, agua líquida o vapor dependiendo de la temperatura.",
        "El agua solo tiene un estado, el líquido, y nunca cambia con la temperatura.",
    ),
    (
        "¿Qué compone el sistema solar?",
        "El Sol y los planetas, satélites, asteroides y otros cuerpos que orbitan a su alrededor.",
        "Está formado por el Sol, los planetas, sus lunas y otros objetos que giran en torno a él.",
        "El sistema solar está formado únicamente por la Tierra y su satélite, la Luna.",
    ),
    (
        "¿Por qué la Luna tiene fases?",
        "Porque su posición respecto al Sol y la Tierra cambia la parte iluminada que vemos.",
        "Las fases ocurren por cómo cambia la porción iluminada visible según su posición.",
        "Las fases de la Luna se producen porque la sombra de la Tierra la cubre cada noche.",
    ),
    (
        "¿Por qué existen las estaciones del año?",
        "Por la inclinación del eje terrestre y el movimiento de traslación alrededor del Sol.",
        "Se deben a la inclinación de la Tierra y a su giro alrededor del Sol.",
        "Las estaciones existen porque la Tierra se aleja y se acerca mucho al Sol cada mes.",
    ),
    (
        "¿Por qué ocurren los terremotos?",
        "Por la liberación repentina de energía cuando las placas tectónicas se mueven.",
        "Se producen al moverse las placas de la corteza y liberarse energía de golpe.",
        "Los terremotos son causados por el viento fuerte que golpea la superficie terrestre.",
    ),
]


@dataclass(frozen=True)
class Case:
    kind: str
    question: str
    expected_answer: str
    answer: str
    expected_correct: bool


@dataclass(frozen=True)
class Result:
    case: Case
    ok: bool
    correct: bool | None
    confidence: float | None
    latency_ms: float
    error: str | None = None


def build_cases(total: int) -> list[Case]:
    cases: list[Case] = []

    for number in range(total):
        question, expected, correct, wrong = OPEN_QUESTIONS[number % len(OPEN_QUESTIONS)]

        cases.append(
            Case(
                kind="exact",
                question=question,
                expected_answer=expected,
                answer=expected,
                expected_correct=True,
            )
        )
        cases.append(
            Case(
                kind="correct",
                question=question,
                expected_answer=expected,
                answer=correct,
                expected_correct=True,
            )
        )
        cases.append(
            Case(
                kind="wrong",
                question=question,
                expected_answer=expected,
                answer=wrong,
                expected_correct=False,
            )
        )

    return cases


def request_json(url: str, payload: dict | None, timeout: float) -> dict:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="GET" if payload is None else "POST",
    )

    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def run_case(base_url: str, case: Case, timeout: float) -> Result:
    started_at = time.perf_counter()

    try:
        data = request_json(
            f"{base_url.rstrip('/')}/verify",
            {
                "question": case.question,
                "expected_answer": case.expected_answer,
                "answer": case.answer,
            },
            timeout,
        )
        latency_ms = (time.perf_counter() - started_at) * 1000

        return Result(
            case=case,
            ok=True,
            correct=bool(data["correct"]),
            confidence=float(data["confidence"]),
            latency_ms=latency_ms,
        )
    except Exception as exc:  # noqa: BLE001 - report every failure
        latency_ms = (time.perf_counter() - started_at) * 1000
        return Result(
            case=case,
            ok=False,
            correct=None,
            confidence=None,
            latency_ms=latency_ms,
            error=f"{type(exc).__name__}: {exc}",
        )


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * fraction)))
    return ordered[index]


def print_summary(results: list[Result], wall_seconds: float) -> int:
    ok_results = [result for result in results if result.ok]
    errors = [result for result in results if not result.ok]
    latencies = [result.latency_ms for result in ok_results]

    mismatches = [
        result
        for result in ok_results
        if result.correct is not result.case.expected_correct
    ]
    false_negatives = [
        result
        for result in ok_results
        if result.case.expected_correct and result.correct is False
    ]
    false_positives = [
        result
        for result in ok_results
        if not result.case.expected_correct and result.correct is True
    ]
    positively_expected = sum(1 for result in ok_results if result.case.expected_correct)
    negatively_expected = len(ok_results) - positively_expected

    best_threshold_line = ""
    scored = [result for result in ok_results if result.confidence is not None]
    if scored:
        best = None
        for step in range(5, 100, 1):
            threshold = step / 100
            tp = sum(
                1
                for result in scored
                if result.case.expected_correct and result.confidence >= threshold
            )
            fp = sum(
                1
                for result in scored
                if not result.case.expected_correct and result.confidence >= threshold
            )
            fn = sum(
                1
                for result in scored
                if result.case.expected_correct and result.confidence < threshold
            )
            precision = tp / (tp + fp) if tp + fp else 0.0
            recall = tp / (tp + fn) if tp + fn else 0.0
            f1 = (
                2 * precision * recall / (precision + recall)
                if precision + recall
                else 0.0
            )

            if best is None or f1 > best[1]:
                best = (threshold, f1, precision, recall)

        best_threshold_line = (
            f"Best threshold ..... {best[0]:.2f} "
            f"(F1 {best[1]:.3f} | precision {best[2]:.3f} | recall {best[3]:.3f})"
        )

    by_kind: dict[str, list[Result]] = {}
    for result in ok_results:
        by_kind.setdefault(result.case.kind, []).append(result)

    print()
    print("=" * 68)
    print("ANSWER VERIFICATION SERVICE - PERFORMANCE")
    print("=" * 68)
    print(f"Requests sent ...... {len(results)}")
    print(f"Successful ......... {len(ok_results)}")
    print(f"Errors ............. {len(errors)}")
    print(f"Wall clock ......... {wall_seconds:.2f} s")
    print(f"Throughput ......... {len(results) / wall_seconds:.2f} req/s")
    print(f"Verdict mismatches . {len(mismatches)} / {len(ok_results)}")
    print(f"False negatives .... {len(false_negatives)} / {positively_expected}")
    print(f"False positives .... {len(false_positives)} / {negatively_expected}")
    if best_threshold_line:
        print(best_threshold_line)
    print()

    if latencies:
        print(
            "Latency (ms) ....... "
            f"min {min(latencies):.1f} | "
            f"mean {statistics.fmean(latencies):.1f} | "
            f"median {statistics.median(latencies):.1f} | "
            f"p95 {percentile(latencies, 0.95):.1f} | "
            f"max {max(latencies):.1f}"
        )
        print()

    print(f"{'Case':<10} {'Count':>6} {'OK':>5} {'Mismatch':>9} {'Mean ms':>9} {'p95 ms':>9}")
    print("-" * 68)

    for kind in ("exact", "correct", "wrong"):
        group = by_kind.get(kind, [])
        if not group:
            continue

        group_mismatches = sum(
            1 for result in group if result.correct is not result.case.expected_correct
        )
        group_latencies = [result.latency_ms for result in group]

        print(
            f"{kind:<10} {len(group):>6} {len(group):>5} {group_mismatches:>9} "
            f"{statistics.fmean(group_latencies):>9.1f} "
            f"{percentile(group_latencies, 0.95):>9.1f}"
        )

    if errors:
        print()
        print("First errors:")
        for result in errors[:5]:
            print(f"  - [{result.case.kind}] {result.error}")

    if mismatches:
        print()
        print("First verdict mismatches:")
        for result in mismatches[:5]:
            print(
                f"  - [{result.case.kind}] expected_correct={result.case.expected_correct} "
                f"got={result.correct} confidence={result.confidence:.4f} "
                f"answer={result.case.answer!r}"
            )

    print("=" * 68)

    return 0 if not errors else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--url",
        default="http://127.0.0.1:8888",
        help="Base URL of the verification service (default: http://127.0.0.1:8888)",
    )
    parser.add_argument(
        "--questions",
        type=int,
        default=100,
        help="Number of questions; 3 requests are sent per question (default: 100)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of concurrent requests (default: 4)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=60.0,
        help="Per-request timeout in seconds (default: 60)",
    )
    args = parser.parse_args()

    if args.questions < 1:
        parser.error("--questions must be at least 1")
    if args.workers < 1:
        parser.error("--workers must be at least 1")

    base_url = args.url.rstrip("/")

    try:
        health = request_json(f"{base_url}/health", None, args.timeout)
    except Exception as exc:  # noqa: BLE001
        print(f"Cannot reach {base_url}/health: {type(exc).__name__}: {exc}")
        return 1

    if health.get("status") != "ok":
        print(f"Service health check failed: {health}")
        return 1

    cases = build_cases(args.questions)

    print(
        f"Running {len(cases)} requests against {base_url} "
        f"({args.questions} questions, {args.workers} workers)..."
    )

    started_at = time.perf_counter()
    results: list[Result] = []

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(run_case, base_url, case, args.timeout) for case in cases]

        for completed, future in enumerate(as_completed(futures), start=1):
            results.append(future.result())

            if completed % 25 == 0 or completed == len(futures):
                print(f"  {completed}/{len(futures)} requests completed")

    wall_seconds = time.perf_counter() - started_at

    return print_summary(results, wall_seconds)


if __name__ == "__main__":
    sys.exit(main())
