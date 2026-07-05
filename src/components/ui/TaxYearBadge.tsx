import { LastUpdated } from "./LastUpdated";
import { TAX_YEAR } from "@/lib/tax";

/**
 * Annual income tax estimator badge — scope is documented on the tax page.
 */
export function TaxYearBadge() {
  return (
    <LastUpdated>
      {TAX_YEAR} annual tax estimate
    </LastUpdated>
  );
}
