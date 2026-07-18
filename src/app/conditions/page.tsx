import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Conditions generales d\'utilisation de la plateforme Affleure.',
}

export default function TermsPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-home-link" aria-label="Retour a Affleure">
          AFFLEURE
        </Link>
      </header>

      <main className="legal-content">
        <h1>Conditions d&apos;utilisation</h1>
        <p className="legal-updated">Derniere mise a jour : 18 juillet 2025</p>

        <section>
          <h2>1. Objet</h2>
          <p>
            Les presentes conditions generales d&apos;utilisation (ci-apres &laquo; CGU &raquo;) regissent l&apos;acces et l&apos;utilisation
            de la plateforme Affleure, editee par We Build Craft, accessible a l&apos;adresse affleure.com.
            En creant un compte ou en utilisant Affleure, vous acceptez les presentes CGU dans leur integralite.
          </p>
        </section>

        <section>
          <h2>2. Description du service</h2>
          <p>
            Affleure est une plateforme de recits geolocatises dediee a Bordeaux Metropole. Elle permet aux utilisateurs
            de deposer et d&apos;explorer des observations, histoires, photos, questions et conversations ancrees sur
            une carte interactive de l&apos;agglomeration bordelaise.
          </p>
        </section>

        <section>
          <h2>3. Inscription et compte</h2>
          <h3>3.1 Conditions d&apos;inscription</h3>
          <p>
            Pour creer un compte, vous devez etre age(e) de 18 ans ou plus et fournir une adresse email valide,
            un nom d&apos;utilisateur unique et un mot de passe securise. Vous pouvez egalement vous inscrire via votre
            compte Google.
          </p>

          <h3>3.2 Responsabilite du compte</h3>
          <p>
            Vous etes responsable de la confidentialite de vos identifiants de connexion et de toutes les activites
            effectuees sous votre compte. En cas d&apos;utilisation non autorisee, vous devez nous en informer
            immediatement a <a href="mailto:support@affleure.com">support@affleure.com</a>.
          </p>

          <h3>3.3 Nom d&apos;utilisateur</h3>
          <p>
            Votre nom d&apos;utilisateur doit comporter entre 3 et 20 caracteres (lettres minuscules, chiffres et underscores).
            Nous nous reservons le droit de refuser ou de retirer un nom d&apos;utilisateur qui serait inapproprie,
            trompeur ou en violation des droits d&apos;autrui.
          </p>
        </section>

        <section>
          <h2>4. Contenu utilisateur</h2>
          <h3>4.1 Propriete</h3>
          <p>
            Vous conservez la propriete intellectuelle du contenu que vous publiez sur Affleure. En publiant du contenu,
            vous nous accordez une licence non exclusive, gratuite et mondiale pour afficher, distribuer et promouvoir
            ce contenu dans le cadre du fonctionnement de la plateforme.
          </p>

          <h3>4.2 Regles de contenu</h3>
          <p>En utilisant Affleure, vous vous engagez a ne pas publier de contenu :</p>
          <ul>
            <li>Illegal, diffamatoire, injurieux ou discriminatoire</li>
            <li>Portant atteinte aux droits de propriete intellectuelle d&apos;autrui</li>
            <li>Contenant des informations personnelles de tiers sans leur consentement</li>
            <li>A caractere publicitaire ou commercial non autorise</li>
            <li>Contenant des virus, logiciels malveillants ou tout code nuisible</li>
            <li>Constituant du harcelement ou de l&apos;intimidation</li>
          </ul>

          <h3>4.3 Moderation</h3>
          <p>
            Nous nous reservons le droit de supprimer tout contenu qui violerait les presentes CGU ou qui serait
            signale par d&apos;autres utilisateurs, sans preavis ni indemnisation. Nous pouvons egalement suspendre
            ou supprimer les comptes des utilisateurs qui ne respecteraient pas ces regles de maniere repetee.
          </p>
        </section>

        <section>
          <h2>5. Donnees de localisation</h2>
          <p>
            Le fonctionnement d&apos;Affleure repose sur la geolocalisation. En utilisant la plateforme, vous consentez
            a l&apos;utilisation de votre position geographique pour afficher la carte et vous permettre de deposer du contenu.
            Vous pouvez choisir l&apos;emplacement de vos publications manuellement sur la carte.
          </p>
        </section>

        <section>
          <h2>6. Propriete intellectuelle</h2>
          <p>
            La marque Affleure, le logo, le design de la plateforme, les textes, les images (hors contenu utilisateur)
            et l&apos;ensemble des elements visuels et techniques sont la propriete de We Build Craft et sont proteges
            par le droit de la propriete intellectuelle. Toute reproduction non autorisee est interdite.
          </p>
        </section>

        <section>
          <h2>7. Limitation de responsabilite</h2>
          <p>
            Affleure est fournie &laquo; en l&apos;etat &raquo;. Nous ne garantissons pas la disponibilite ininterrompue
            de la plateforme ni l&apos;absence d&apos;erreurs. Nous ne saurions etre tenus responsables des dommages directs
            ou indirects resultant de l&apos;utilisation ou de l&apos;impossibilite d&apos;utiliser la plateforme.
          </p>
          <p>
            Nous ne sommes pas responsables du contenu publie par les utilisateurs. Chaque utilisateur est seul
            responsable du contenu qu&apos;il publie sur la plateforme.
          </p>
        </section>

        <section>
          <h2>8. Gratuite du service</h2>
          <p>
            L&apos;utilisation d&apos;Affleure est gratuite. Nous nous reservons le droit d&apos;introduire des fonctionnalites
            payantes a l&apos;avenir, qui feraient l&apos;objet de conditions specifiques.
          </p>
        </section>

        <section>
          <h2>9. Resiliation</h2>
          <p>
            Vous pouvez supprimer votre compte a tout moment. Nous nous reservons egalement le droit de suspendre
            ou de supprimer votre compte en cas de violation des presentes CGU, sans preavis.
          </p>
        </section>

        <section>
          <h2>10. Modification des CGU</h2>
          <p>
            Nous pouvons modifier les presentes CGU a tout moment. Les modifications prennent effet des leur
            publication sur cette page. En continuant d&apos;utiliser Affleure apres une modification, vous acceptez
            les nouvelles conditions. En cas de modification substantielle, nous vous en informerons par email
            ou via une notification sur la plateforme.
          </p>
        </section>

        <section>
          <h2>11. Droit applicable</h2>
          <p>
            Les presentes CGU sont regies par le droit francais. Tout litige relatif a l&apos;utilisation d&apos;Affleure
            sera soumis aux tribunaux competents de Bordeaux, France.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant les presentes conditions d&apos;utilisation, vous pouvez nous contacter a :
          </p>
          <p className="legal-contact">
            We Build Craft<br />
            Email : <a href="mailto:support@affleure.com">support@affleure.com</a>
          </p>
        </section>
      </main>

      <footer className="legal-footer">
        <Link href="/confidentialite">Politique de confidentialite</Link>
        <span className="legal-footer-sep">&middot;</span>
        <Link href="/">Retour a Affleure</Link>
      </footer>
    </div>
  )
}
