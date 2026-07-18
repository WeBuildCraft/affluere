import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialite',
  description: 'Politique de confidentialite d\'Affleure \u2014 comment nous collectons, utilisons et protegeons vos donnees personnelles.',
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-home-link" aria-label="Retour a Affleure">
          AFFLEURE
        </Link>
      </header>

      <main className="legal-content">
        <h1>Politique de confidentialite</h1>
        <p className="legal-updated">Derniere mise a jour : 18 juillet 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            We Build Craft (&laquo; nous &raquo;, &laquo; notre &raquo;) exploite la plateforme Affleure, accessible a l&apos;adresse affleure.com.
            Nous nous engageons a proteger la vie privee de nos utilisateurs. Cette politique de confidentialite explique quelles
            informations nous collectons, comment nous les utilisons et quels sont vos droits.
          </p>
        </section>

        <section>
          <h2>2. Donnees collectees</h2>
          <h3>2.1 Donnees que vous fournissez</h3>
          <p>
            Lorsque vous creez un compte, nous collectons votre adresse email, votre nom d&apos;utilisateur
            et votre mot de passe (stocke sous forme hashee). Si vous choisissez l&apos;authentification via Google, nous
            recevons votre nom et adresse email associes a votre compte Google.
          </p>

          <h3>2.2 Contenu que vous publiez</h3>
          <p>
            Les observations, histoires, photos, questions et conversations que vous deposez sur Affleure sont stockees
            sur nos serveurs. Ce contenu inclut le texte, les images et les coordonnees geographiques associees.
          </p>

          <h3>2.3 Donnees de localisation</h3>
          <p>
            Affleure utilise votre position geographique pour afficher la carte et vous permettre de deposer du contenu
            geolocatise. Cette localisation n&apos;est utilisee que dans le cadre du fonctionnement de l&apos;application et
            n&apos;est pas partagee avec des tiers.
          </p>

          <h3>2.4 Donnees techniques</h3>
          <p>
            Nous collectons automatiquement certaines informations techniques telles que votre adresse IP, le type de
            navigateur, le systeme d&apos;exploitation et les pages consultees, afin d&apos;assurer le bon fonctionnement
            et la securite de la plateforme.
          </p>
        </section>

        <section>
          <h2>3. Utilisation des donnees</h2>
          <p>Nous utilisons vos donnees pour :</p>
          <ul>
            <li>Creer et gerer votre compte utilisateur</li>
            <li>Afficher votre contenu sur la carte de Bordeaux Metropole</li>
            <li>Assurer la securite et le bon fonctionnement de la plateforme</li>
            <li>Vous envoyer des notifications liees a votre compte (confirmation d&apos;inscription, reinitialisation de mot de passe)</li>
            <li>Ameliorer l&apos;experience utilisateur et developper de nouvelles fonctionnalites</li>
          </ul>
        </section>

        <section>
          <h2>4. Partage des donnees</h2>
          <p>
            Nous ne vendons ni ne louons vos donnees personnelles a des tiers. Votre contenu publie (observations, histoires, etc.)
            est visible par les autres utilisateurs de la plateforme conformement a sa nature publique.
            Votre adresse email n&apos;est jamais visible publiquement.
          </p>
          <p>
            Nous pouvons partager vos informations avec nos sous-traitants techniques (hebergement, base de donnees)
            dans la stricte mesure necessaire au fonctionnement de la plateforme.
          </p>
        </section>

        <section>
          <h2>5. Hebergement et securite</h2>
          <p>
            Vos donnees sont hebergees sur des serveurs securises fournis par Supabase et Vercel. Nous mettons en &oelig;uvre
            des mesures de securite appropriees pour proteger vos informations contre tout acces non autorise,
            modification ou divulgation.
          </p>
        </section>

        <section>
          <h2>6. Conservation des donnees</h2>
          <p>
            Nous conservons vos donnees personnelles tant que votre compte est actif. Si vous supprimez votre compte,
            vos donnees personnelles seront supprimees dans un delai de 30 jours, a l&apos;exception des informations
            que nous sommes tenus de conserver par la loi.
          </p>
        </section>

        <section>
          <h2>7. Vos droits</h2>
          <p>
            Conformement au Reglement General sur la Protection des Donnees (RGPD), vous disposez des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d&apos;acces :</strong> obtenir une copie de vos donnees personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des donnees inexactes</li>
            <li><strong>Droit a l&apos;effacement :</strong> demander la suppression de vos donnees</li>
            <li><strong>Droit a la portabilite :</strong> recevoir vos donnees dans un format structure</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos donnees</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous a <a href="mailto:support@affleure.com">support@affleure.com</a>.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            Affleure utilise des cookies strictement necessaires au fonctionnement de la plateforme (authentification,
            preferences de session). Nous n&apos;utilisons pas de cookies publicitaires ni de cookies de suivi tiers.
          </p>
        </section>

        <section>
          <h2>9. Mineurs</h2>
          <p>
            Affleure est destinee aux personnes agees de 18 ans ou plus. Nous ne collectons pas sciemment
            de donnees aupres de mineurs. Si vous etes parent et pensez que votre enfant nous a fourni des
            informations personnelles, contactez-nous a <a href="mailto:support@affleure.com">support@affleure.com</a>.
          </p>
        </section>

        <section>
          <h2>10. Modifications</h2>
          <p>
            Nous pouvons mettre a jour cette politique de confidentialite. En cas de modification substantielle,
            nous vous en informerons par email ou via une notification sur la plateforme. La date de derniere
            mise a jour est indiquee en haut de cette page.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Pour toute question relative a cette politique de confidentialite ou a vos donnees personnelles,
            vous pouvez nous contacter a :
          </p>
          <p className="legal-contact">
            We Build Craft<br />
            Email : <a href="mailto:support@affleure.com">support@affleure.com</a>
          </p>
        </section>
      </main>

      <footer className="legal-footer">
        <Link href="/conditions">Conditions d&apos;utilisation</Link>
        <span className="legal-footer-sep">&middot;</span>
        <Link href="/">Retour a Affleure</Link>
      </footer>
    </div>
  )
}
